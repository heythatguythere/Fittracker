import { useEffect, useState, FormEvent, ReactNode } from "react";
import { useAuth } from "../AuthContext";
import Layout from "../components/Layout";
import { Plus, X, Pencil, Trash, Loader2, Scale, TrendingUp, TrendingDown, Calendar, Flame, Weight } from "lucide-react";
import axios from "axios";
import type { Measurement, UserProfile } from "../../shared/types";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, icon }: { title: string, value: string, icon: ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

// --- Main Measurements Page Component ---
export default function Measurements() {
    const { user } = useAuth();
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState<'create' | 'edit' | null>(null);
    const [measurementToEdit, setMeasurementToEdit] = useState<Measurement | null>(null);
    const [isDeleting, setIsDeleting] = useState("");

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [measurementsRes, profileRes] = await Promise.all([
                axios.get("/api/measurements", { withCredentials: true }),
                axios.get("/api/profile", { withCredentials: true })
            ]);
            // Sort by date for charting
            const sortedMeasurements = measurementsRes.data.sort((a: Measurement, b: Measurement) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime());
            setMeasurements(sortedMeasurements);
            setProfile(profileRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const measurementData = {
            ...data,
            measurement_date: new Date(data.measurement_date as string),
            weight_kg: parseFloat(data.weight_kg as string) || undefined,
            body_fat_percentage: parseFloat(data.body_fat_percentage as string) || undefined,
            waist_cm: parseFloat(data.waist_cm as string) || undefined,
            chest_cm: parseFloat(data.chest_cm as string) || undefined,
        };

        try {
            if (showModal === 'edit' && measurementToEdit) {
                await axios.put(`/api/measurements/${measurementToEdit._id}`, measurementData, { withCredentials: true });
            } else {
                await axios.post("/api/measurements", measurementData, { withCredentials: true });
            }
            fetchInitialData(); // Refetch all data to update list and stats
            setShowModal(null);
        } catch (error) {
            console.error("Failed to save measurement:", error);
            alert("Error: Could not save measurement.");
        }
    };

    const deleteMeasurement = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this measurement?")) {
            setIsDeleting(id);
            try {
                await axios.delete(`/api/measurements/${id}`, { withCredentials: true });
                setMeasurements(prev => prev.filter(m => m._id !== id));
            } catch (error) {
                console.error("Failed to delete measurement:", error);
                alert("Error: Could not delete measurement.");
            } finally {
                setIsDeleting("");
            }
        }
    };
    
    const openEditModal = (measurement: Measurement) => {
        setMeasurementToEdit(measurement);
        setShowModal('edit');
    };

    // --- Safely calculate stats ---
    const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
    const initialMeasurement = measurements.length > 0 ? measurements[0] : null;
    const weightChange = (latestMeasurement && initialMeasurement && latestMeasurement.weight_kg && initialMeasurement.weight_kg) ? (latestMeasurement.weight_kg - initialMeasurement.weight_kg).toFixed(1) : '0.0';
    const calculateBmi = (weightKg?: number, heightCm?: number) => {
        if (!weightKg || !heightCm) return null;
        const heightM = heightCm / 100;
        return (weightKg / (heightM * heightM)).toFixed(2);
    };
    const bmi = calculateBmi(latestMeasurement?.weight_kg ?? undefined, profile?.height_cm ?? undefined);

    if (loading) { return <Layout><div className="flex justify-center items-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>; }

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div><h1 className="text-5xl font-bold">Body Measurements</h1><p className="text-gray-600 mt-2 text-lg">Track your weight and see your progress over time.</p></div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal('create')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg flex items-center space-x-2"><Plus /><span>Add Measurement</span></motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Latest Weight" value={latestMeasurement ? `${latestMeasurement.weight_kg} kg` : 'N/A'} icon={<Weight />} />
                    <StatCard title="Total Change" value={`${weightChange} kg`} icon={Number(weightChange) >= 0 ? <TrendingUp /> : <TrendingDown />} />
                    <StatCard title="BMI" value={bmi || 'N/A'} icon={<Scale />} />
                    <StatCard title="Body Fat %" value={latestMeasurement?.body_fat_percentage ? `${latestMeasurement.body_fat_percentage}%` : 'N/A'} icon={<Flame />} />
                </div>
                
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                    <h2 className="text-2xl font-bold mb-4">Weight Progress</h2>
                    {measurements.length > 1 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer>
                                <LineChart data={measurements.map(m => ({...m, date: new Date(m.measurement_date).toLocaleDateString()}))} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                                    <Tooltip />
                                    {profile?.weight_goal_kg && <ReferenceLine y={profile.weight_goal_kg} label={{ value: "Goal", position: "insideTopRight" }} stroke="red" strokeDasharray="3 3" />}
                                    <Line type="monotone" dataKey="weight_kg" name="Weight (kg)" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-96 flex items-center justify-center text-center text-gray-500"><p>Log at least two measurements to see your progress chart.</p></div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Measurement History</h2>
                    {measurements.length === 0 ? (
                        <div className="text-center py-16 bg-white/60 backdrop-blur-xl rounded-2xl border"><Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold">No measurements recorded</h3><p className="text-gray-600 mb-6">Start tracking by recording your first measurement.</p><button onClick={() => setShowModal('create')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">Record First Measurement</button></div>
                    ) : (
                        <div className="space-y-4">
                            {measurements.slice().reverse().map((m) => ( // reverse a copy to show most recent first
                                <motion.div key={m._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-xl shadow-sm border p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2"><Calendar className="h-5 w-5 text-gray-400" /><span className="text-lg font-medium">{new Date(m.measurement_date).toLocaleDateString()}</span></div>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => openEditModal(m)} className="text-gray-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                                            <button onClick={() => deleteMeasurement(m._id as string)} disabled={isDeleting === m._id} className="text-gray-400 hover:text-red-600 disabled:opacity-50">{isDeleting === m._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {m.weight_kg && <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-600">Weight</p><p className="font-bold text-xl">{m.weight_kg} kg</p></div>}
                                        {m.body_fat_percentage && <div className="bg-green-50 p-3 rounded-lg"><p className="text-sm text-green-600">Body Fat</p><p className="font-bold text-xl">{m.body_fat_percentage}%</p></div>}
                                        {m.waist_cm && <div className="bg-orange-50 p-3 rounded-lg"><p className="text-sm text-orange-600">Waist</p><p className="font-bold text-xl">{m.waist_cm} cm</p></div>}
                                        {m.chest_cm && <div className="bg-red-50 p-3 rounded-lg"><p className="text-sm text-red-600">Chest</p><p className="font-bold text-xl">{m.chest_cm} cm</p></div>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {(showModal === 'create' || (showModal === 'edit' && measurementToEdit)) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-xl p-6 w-full max-w-lg">
                                <div className="flex justify-between items-center border-b pb-3 mb-4"><h2 className="text-2xl font-semibold">{showModal === 'edit' ? "Edit Measurement" : "New Measurement"}</h2><button onClick={() => setShowModal(null)}><X/></button></div>
                                <form onSubmit={handleFormSubmit} className="space-y-4">
                                    <div><label className="block text-sm font-medium">Date *</label><input type="date" name="measurement_date" required defaultValue={measurementToEdit ? new Date(measurementToEdit.measurement_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} className="w-full border rounded-lg p-2" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium">Weight (kg)</label><input type="number" name="weight_kg" step="0.1" min="0" defaultValue={measurementToEdit?.weight_kg || ""} className="w-full border rounded-lg p-2"/></div>
                                        <div><label className="block text-sm font-medium">Body Fat (%)</label><input type="number" name="body_fat_percentage" step="0.1" min="0" max="100" defaultValue={measurementToEdit?.body_fat_percentage || ""} className="w-full border rounded-lg p-2"/></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium">Waist (cm)</label><input type="number" name="waist_cm" step="0.1" min="0" defaultValue={measurementToEdit?.waist_cm || ""} className="w-full border rounded-lg p-2"/></div>
                                        <div><label className="block text-sm font-medium">Chest (cm)</label><input type="number" name="chest_cm" step="0.1" min="0" defaultValue={measurementToEdit?.chest_cm || ""} className="w-full border rounded-lg p-2"/></div>
                                    </div>
                                    <div><label className="block text-sm font-medium">Notes</label><textarea name="notes" rows={2} defaultValue={measurementToEdit?.notes || ""} className="w-full border rounded-lg p-2"/></div>
                                    <div className="flex justify-end space-x-3 pt-4"><button type="button" onClick={() => setShowModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save Changes</button></div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}