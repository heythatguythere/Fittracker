import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Plus, Edit, Trash2, Loader2, Save, X, Lightbulb } from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { DietEntry, MealSuggestion } from '../../shared/types';

export default function Diet() {
    const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Partial<DietEntry>>({});
    const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        fetchDietEntries();
    }, []);

    const fetchDietEntries = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/diet', { withCredentials: true });
            setDietEntries(res.data);
        } catch (err) {
            setError('Failed to fetch diet entries.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (entry: Partial<DietEntry> | null = null) => {
        if (entry) {
            setIsEditing(true);
            setCurrentEntry({ ...entry, entry_date: new Date(entry.entry_date!).toISOString().split('T')[0] });
        } else {
            setIsEditing(false);
            setCurrentEntry({ entry_date: new Date().toISOString().split('T')[0], meal_type: 'breakfast' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async () => {
        if (!currentEntry.food_name) return;
        try {
            if (isEditing) {
                await axios.put(`/api/diet/${currentEntry._id}`, currentEntry, { withCredentials: true });
            } else {
                await axios.post('/api/diet', currentEntry, { withCredentials: true });
            }
            fetchDietEntries();
            handleCloseModal();
        } catch (err) {
            setError(`Failed to save entry.`);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axios.delete(`/api/diet/${id}`, { withCredentials: true });
                fetchDietEntries();
            } catch (err) {
                setError('Failed to delete entry.');
            }
        }
    };
    
    const handleGetSuggestions = async () => {
        setLoadingSuggestions(true);
        setError(null);
        try {
            const res = await axios.get('/api/ai/meal-suggestions', { withCredentials: true });
            setSuggestions(res.data);
        } catch (err) {
            setError('Failed to get meal suggestions.');
        } finally {
            setLoadingSuggestions(false);
        }
    };
    
    const useSuggestion = (suggestion: MealSuggestion) => {
        setCurrentEntry({
            ...currentEntry,
            food_name: suggestion.meal_name,
            calories: suggestion.calories,
            protein_g: suggestion.protein_g,
            carbs_g: suggestion.carbs_g,
            fat_g: suggestion.fat_g,
            notes: suggestion.description
        });
        setSuggestions([]); // Close suggestions
    };

    const dailyTotals = dietEntries.reduce((acc, entry) => {
        const date = new Date(entry.entry_date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        // FIX: Changed calories_g to calories
        acc[date].calories += entry.calories ?? 0;
        acc[date].protein += entry.protein_g ?? 0;
        acc[date].carbs += entry.carbs_g ?? 0;
        acc[date].fat += entry.fat_g ?? 0;
        return acc;
    }, {} as Record<string, { calories: number; protein: number; carbs: number; fat: number }>);
    
    const chartData = Object.keys(dailyTotals).map(date => ({
        date: new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
        Calories: dailyTotals[date].calories,
        Protein: dailyTotals[date].protein,
        Carbs: dailyTotals[date].carbs,
        Fat: dailyTotals[date].fat,
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (loading) return <Layout><div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>;

    return (
        <Layout>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div><h1 className="text-4xl font-bold flex items-center"><Utensils className="h-10 w-10 mr-3 text-blue-600" />Diet Tracker</h1><p className="text-gray-600 mt-2">Log your meals and track your nutritional intake.</p></div>
                    <motion.button onClick={() => handleOpenModal()} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Plus /><span>Add Food Entry</span></motion.button>
                </motion.div>

                {error && <div className="bg-red-100 p-4 rounded-lg">{error}</div>}
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6 h-96">
                     <h2 className="text-2xl font-bold text-gray-900 mb-4">Calorie Intake Over Time</h2>
                    <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Calories" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
                
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6 h-96">
                     <h2 className="text-2xl font-bold text-gray-900 mb-4">Macronutrient Distribution</h2>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Protein" stackId="a" fill="#8884d8" />
                            <Bar dataKey="Carbs" stackId="a" fill="#82ca9d" />
                            <Bar dataKey="Fat" stackId="a" fill="#ffc658" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Diet History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                                <tr className="border-b">
                                    <th className="p-3">Date</th><th className="p-3">Food</th><th className="p-3">Meal</th><th className="p-3">Calories</th><th className="p-3">Protein (g)</th><th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dietEntries.map((entry) => (
                                    <tr key={entry._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{new Date(entry.entry_date).toLocaleDateString()}</td><td className="p-3 font-medium">{entry.food_name}</td><td className="p-3 capitalize">{entry.meal_type}</td>
                                        {/* FIX: Changed calories_g to calories */}
                                        <td className="p-3">{entry.calories ?? 'N/A'}</td>
                                        <td className="p-3">{entry.protein_g ?? 'N/A'}</td>
                                        <td className="p-3 flex space-x-2">
                                            <button onClick={() => handleOpenModal(entry)} className="text-blue-600"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(entry._id)} className="text-red-600"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
                
                <AnimatePresence>
                    {isModalOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                                <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X /></button>
                                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit' : 'Add'} Diet Entry</h2>
                                
                                <div className="space-y-4">
                                     <input type="date" value={currentEntry.entry_date?.toString()} onChange={(e) => setCurrentEntry({ ...currentEntry, entry_date: e.target.value })} className="w-full p-2 border rounded-lg" />
                                     <select value={currentEntry.meal_type ?? 'breakfast'} onChange={(e) => setCurrentEntry({ ...currentEntry, meal_type: e.target.value })} className="w-full p-2 border rounded-lg"><option>breakfast</option><option>lunch</option><option>dinner</option><option>snack</option></select>
                                     <input type="text" placeholder="Food Name" value={currentEntry.food_name ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, food_name: e.target.value })} className="w-full p-2 border rounded-lg" />
                                     {/* FIX: Changed calories_g to calories */}
                                     <input type="number" placeholder="Calories" value={currentEntry.calories ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, calories: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                     <input type="number" placeholder="Protein (g)" value={currentEntry.protein_g ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, protein_g: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                     <input type="number" placeholder="Carbs (g)" value={currentEntry.carbs_g ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, carbs_g: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                     <input type="number" placeholder="Fat (g)" value={currentEntry.fat_g ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, fat_g: parseFloat(e.target.value) || null })} className="w-full p-2 border rounded-lg" />
                                     <textarea placeholder="Notes" value={currentEntry.notes ?? ''} onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })} className="w-full p-2 border rounded-lg"></textarea>
                                </div>
                                
                                <div className="mt-6 space-y-4">
                                    <button onClick={handleGetSuggestions} disabled={loadingSuggestions} className="w-full flex items-center justify-center p-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 disabled:bg-yellow-300">
                                        {loadingSuggestions ? <Loader2 className="animate-spin" /> : <Lightbulb />}<span className="ml-2">Get AI Meal Suggestions</span>
                                    </button>
                                    
                                    {suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold">Suggestions:</h3>
                                            {suggestions.map((s, i) => (
                                                <div key={i} className="bg-gray-100 p-3 rounded-lg">
                                                    <h4 className="font-bold">{s.meal_name}</h4>
                                                    <p className="text-sm text-gray-600">{s.description}</p>
                                                    <p className="text-xs">Cals: {s.calories}, P: {s.protein_g}g, C: {s.carbs_g}g, F: {s.fat_g}g</p>
                                                    <button onClick={() => useSuggestion(s)} className="text-sm text-blue-600 mt-1">Use this meal</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-4 mt-6">
                                    <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center"><Save size={18} className="mr-2"/>Save</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}