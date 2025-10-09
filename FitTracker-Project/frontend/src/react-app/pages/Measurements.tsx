import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Plus, Edit, Trash2, Loader2, TrendingUp, TrendingDown, Minus, Info, Save } from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Measurement } from '../../shared/types';

export default function Measurements() {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMeasurement, setCurrentMeasurement] = useState<Partial<Measurement>>({});

    useEffect(() => {
        fetchMeasurements();
    }, []);

    const fetchMeasurements = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/measurements', { withCredentials: true });
            const sortedMeasurements = res.data.sort((a: Measurement, b: Measurement) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime());
            setMeasurements(sortedMeasurements);
        } catch (err) {
            setError('Failed to fetch measurements.');
        } finally {
            setLoading(false);
        }
    };
    
    const sortedMeasurements = useMemo(() => 
        [...measurements].sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()), 
        [measurements]
    );

    const latestMeasurement = useMemo(() => sortedMeasurements[sortedMeasurements.length - 1], [sortedMeasurements]);
    const initialMeasurement = useMemo(() => sortedMeasurements[0], [sortedMeasurements]);

    const handleOpenModal = (measurement: Partial<Measurement> | null = null) => {
        if (measurement) {
            setIsEditing(true);
            setCurrentMeasurement({ ...measurement, measurement_date: new Date(measurement.measurement_date!).toISOString().split('T')[0] });
        } else {
            setIsEditing(false);
            setCurrentMeasurement({ measurement_date: new Date().toISOString().split('T')[0] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentMeasurement({});
    };

    const handleSave = async () => {
        if (!currentMeasurement.measurement_date) {
            setError('Date is required.');
            return;
        }
        try {
            if (isEditing) {
                await axios.put(`/api/measurements/${currentMeasurement._id}`, currentMeasurement, { withCredentials: true });
            } else {
                await axios.post('/api/measurements', currentMeasurement, { withCredentials: true });
            }
            fetchMeasurements();
            handleCloseModal();
        } catch (err) {
            setError(`Failed to save measurement.`);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this measurement?')) {
            try {
                await axios.delete(`/api/measurements/${id}`, { withCredentials: true });
                fetchMeasurements();
            } catch (err) {
                setError('Failed to delete measurement.');
            }
        }
    };
    
     const getWeightChange = () => {
        if (sortedMeasurements.length < 2) return { value: 0, isLoss: false };
        const change = (latestMeasurement?.weight_kg ?? 0) - (sortedMeasurements[sortedMeasurements.length - 2]?.weight_kg ?? 0);
        return { value: parseFloat(change.toFixed(2)), isLoss: change < 0 };
    };
    const { value: recentChange, isLoss } = getWeightChange();

    const totalLoss = ((initialMeasurement?.weight_kg ?? 0) - (latestMeasurement?.weight_kg ?? 0)).toFixed(2);

    const chartData = useMemo(() => sortedMeasurements.map(m => ({
        date: new Date(m.measurement_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Weight: m.weight_kg,
        'Body Fat %': m.body_fat_percentage
    })), [sortedMeasurements]);

    if (loading) return <Layout><div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>;

    return (
        <Layout>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div><h1 className="text-4xl font-bold flex items-center"><Scale className="h-10 w-10 mr-3 text-blue-600" />Measurements</h1><p className="text-gray-600 mt-2">Track your body composition and progress over time.</p></div>
                    <motion.button onClick={() => handleOpenModal()} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Plus /><span>Add Measurement</span></motion.button>
                </motion.div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Error:</strong><span className="block sm:inline"> {error}</span></div>}

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border">
                        <h3 className="font-semibold text-gray-500">Current Weight</h3>
                        <p className="text-4xl font-bold text-gray-900">{latestMeasurement?.weight_kg ?? 'N/A'} kg</p>
                    </div>
                     <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border">
                        <h3 className="font-semibold text-gray-500">Change (vs last)</h3>
                        <div className={`text-4xl font-bold flex items-center ${recentChange === 0 ? 'text-gray-900' : isLoss ? 'text-green-600' : 'text-red-600'}`}>
                           {recentChange === 0 ? <Minus/> : isLoss ? <TrendingDown/> : <TrendingUp/>} {Math.abs(recentChange)} kg
                        </div>
                    </div>
                     <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border">
                        <h3 className="font-semibold text-gray-500">Total Weight Loss</h3>
                        <p className="text-4xl font-bold text-green-600">{totalLoss} kg</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6 h-96">
                     <h2 className="text-2xl font-bold text-gray-900 mb-4">Progress Over Time</h2>
                    {sortedMeasurements.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                                <XAxis dataKey="date" stroke="#6b7280"/>
                                <YAxis yAxisId="left" stroke="#3b82f6"/>
                                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="Weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line yAxisId="right" type="monotone" dataKey="Body Fat %" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Info className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">Not Enough Data to Display Chart</h3>
                            <p className="text-gray-500">Add at least two measurements to see your progress chart.</p>
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Measurement History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Weight (kg)</th>
                                    <th className="p-3">Body Fat (%)</th>
                                    <th className="p-3">Waist (cm)</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {measurements.map((m) => (
                                    <tr key={m._id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">{new Date(m.measurement_date).toLocaleDateString()}</td>
                                        <td className="p-3">{m.weight_kg ?? 'N/A'}</td>
                                        <td className="p-3">{m.body_fat_percentage ?? 'N/A'}</td>
                                        <td className="p-3">{m.waist_cm ?? 'N/A'}</td>
                                        <td className="p-3 flex space-x-2">
                                            <button onClick={() => handleOpenModal(m)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(m._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                                <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit' : 'Add'} Measurement</h2>
                                <div className="space-y-4">
                                    <input type="date" value={currentMeasurement.measurement_date?.toString()} onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, measurement_date: e.target.value })} className="w-full p-2 border rounded-lg" />
                                    <input type="number" placeholder="Weight (kg)" value={currentMeasurement.weight_kg ?? ''} onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, weight_kg: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                    <input type="number" placeholder="Body Fat (%)" value={currentMeasurement.body_fat_percentage ?? ''} onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, body_fat_percentage: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                    <input type="number" placeholder="Waist (cm)" value={currentMeasurement.waist_cm ?? ''} onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, waist_cm: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                    <textarea placeholder="Notes" value={currentMeasurement.notes ?? ''} onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, notes: e.target.value })} className="w-full p-2 border rounded-lg"></textarea>
                                </div>
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"><Save size={18} className="mr-2"/>Save</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}