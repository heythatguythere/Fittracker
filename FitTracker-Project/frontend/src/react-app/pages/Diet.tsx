// react-app/pages/diet.tsx - Updated types
import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "../AuthContext";
import Layout from "../components/Layout";
import NutritionChart from "../components/NutritionChart";
import { Plus, Apple, Coffee, Sun, Moon, Cookie, BarChart3, X, Loader2, Trash2, Lightbulb } from "lucide-react";
import axios from "axios";
import type { DietEntry, UserProfile, MealSuggestion } from "../../shared/types";

const mealTypeIcons: { [key: string]: React.ElementType } = { breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Cookie };
const mealTypeColors: { [key: string]: string } = {
    breakfast: "bg-yellow-50 text-yellow-700 border-yellow-200",
    lunch: "bg-orange-50 text-orange-700 border-orange-200",
    dinner: "bg-purple-50 text-purple-700 border-purple-200",
    snack: "bg-green-50 text-green-700 border-green-200",
};

export default function Diet() {
    const { user } = useAuth();
    const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState("");

    useEffect(() => {
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [dietRes, profileRes] = await Promise.all([
                axios.get("/api/diet", { withCredentials: true }),
                axios.get("/api/profile", { withCredentials: true })
            ]);
            setDietEntries(dietRes.data);
            setProfile(profileRes.data);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const createDietEntry = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const newEntry = {
            ...data,
            entry_date: new Date(data.entry_date as string),
            calories: parseFloat(data.calories as string) || 0,
            protein_g: parseFloat(data.protein_g as string) || 0,
            carbs_g: parseFloat(data.carbs_g as string) || 0,
            fat_g: parseFloat(data.fat_g as string) || 0,
        };
        try {
            const response = await axios.post("/api/diet", newEntry, { withCredentials: true });
            setDietEntries(prev => [response.data, ...prev].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()));
            setShowCreateModal(false);
        } catch (error) {
            console.error("Failed to create diet entry:", error);
            alert("Error: Could not save diet entry.");
        }
    };

    const deleteDietEntry = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            try {
                await axios.delete(`/api/diet/${id}`, { withCredentials: true });
                setDietEntries(prev => prev.filter((entry: DietEntry) => entry._id !== id));
            } catch (error) {
                console.error("Failed to delete diet entry:", error);
                alert("Error: Could not delete entry.");
            }
        }
    };

    const getSuggestions = async () => {
        setSuggestionsLoading(true);
        setSuggestionError("");
        setSuggestions([]);
        try {
            const payload = { profile, dietEntries: todaysEntries };
            const response = await axios.post("/api/diet/suggestions", payload, { withCredentials: true });
            setSuggestions(response.data.suggestions);
        } catch (error) {
            console.error("Failed to get suggestions:", error);
            setSuggestionError("Failed to get suggestions. Please try again.");
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = dietEntries.filter(entry => new Date(entry.entry_date).toISOString().split('T')[0] === today);
    const totalCaloriesToday = todaysEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
    const totalProteinToday = todaysEntries.reduce((sum, entry) => sum + (entry.protein_g || 0), 0);
    const totalCarbsToday = todaysEntries.reduce((sum, entry) => sum + (entry.carbs_g || 0), 0);
    const totalFatToday = todaysEntries.reduce((sum, entry) => sum + (entry.fat_g || 0), 0);
    const dailyCalorieGoal = (profile as UserProfile)?.calorie_goal || 2000;
    const remainingCalories = Math.max(0, dailyCalorieGoal - totalCaloriesToday);

    const entriesByDate = dietEntries.reduce((acc, entry) => {
        const date = new Date(entry.entry_date).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {} as Record<string, DietEntry[]>);

    if (loading) {
        return <Layout><div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-12 w-12 text-blue-600" /></div></Layout>;
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Diet Tracking</h1>
                        <p className="text-gray-600 mt-2">Monitor your nutrition and caloric intake.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => setShowAnalytics(!showAnalytics)} className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${showAnalytics ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}><BarChart3 className="h-5 w-5" /><span>{showAnalytics ? 'Hide Analytics' : 'Show Analytics'}</span></button>
                        <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"><Plus className="h-5 w-5" /><span>Add Food Entry</span></button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div><h3 className="text-sm font-medium text-gray-600">Calories Remaining</h3><p className="text-2xl font-bold text-gray-900 mt-1">{remainingCalories} kcal</p></div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center"><span className="text-2xl">🎯</span></div>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, (totalCaloriesToday / dailyCalorieGoal) * 100)}%` }} /></div>
                        <div className="flex justify-between text-xs text-gray-600 mt-2"><span>{totalCaloriesToday} kcal</span><span>Goal: {dailyCalorieGoal} kcal</span></div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-gray-900">Meal Suggestions</h3><button onClick={getSuggestions} disabled={suggestionsLoading} className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2"><Lightbulb className="h-5 w-5" /><span>{suggestionsLoading ? "Thinking..." : "Get Ideas"}</span></button></div>
                        {suggestionsLoading && <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin text-gray-500" /></div>}
                        {suggestionError && <div className="text-red-500 text-sm">{suggestionError}</div>}
                        {suggestions.length > 0 && <div className="space-y-3">{suggestions.map((s, i) => (<div key={i} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"><Apple className="h-5 w-5 text-green-600 shrink-0 mt-1" /><div><p className="font-semibold">{s.meal_name}</p><p className="text-sm text-gray-600">{s.description}</p><div className="flex flex-wrap items-center mt-2 space-x-3 text-xs"><span className="font-medium text-gray-700">{s.calories} kcal</span><span className="text-gray-400">•</span><span className="font-medium text-red-600">{s.protein_g}g P</span><span className="font-medium text-orange-600">{s.carbs_g}g C</span><span className="font-medium text-purple-600">{s.fat_g}g F</span></div></div></div>))}</div>}
                    </div>
                </div>

                {showAnalytics && (
                  <div className="mb-8"><h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Nutrition Analytics</h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><NutritionChart data={{ protein: totalProteinToday, carbs: totalCarbsToday, fat: totalFatToday }} totalCalories={totalCaloriesToday} type="pie" /><div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-center"><h3 className="text-lg font-semibold mb-2">Today's Macros</h3><p className="text-4xl font-bold">{totalCaloriesToday} <span className="text-lg font-medium text-gray-600">kcal</span></p><div className="grid grid-cols-3 gap-4 mt-4 text-center"><div className="bg-red-50 p-4 rounded-lg"><p className="text-sm text-red-600">Protein</p><p className="font-bold text-lg">{totalProteinToday}g</p></div><div className="bg-orange-50 p-4 rounded-lg"><p className="text-sm text-orange-600">Carbs</p><p className="font-bold text-lg">{totalCarbsToday}g</p></div><div className="bg-purple-50 p-4 rounded-lg"><p className="text-sm text-purple-600">Fat</p><p className="font-bold text-lg">{totalFatToday}g</p></div></div></div></div></div>
                )}

                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Food Entries</h2>
                {Object.keys(entriesByDate).length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl border"><Apple className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">No diet entries yet</h3><p className="text-gray-600 mb-6">Log your first meal to start tracking your nutrition.</p><button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">Add First Entry</button></div>
                ) : (
                  <div className="space-y-6">{Object.keys(entriesByDate).map(date => (<div key={date}><h3 className="text-lg font-semibold text-gray-900 mb-3">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{entriesByDate[date].map((entry: DietEntry) => { const Icon = mealTypeIcons[entry.meal_type as keyof typeof mealTypeIcons]; const colorClass = mealTypeColors[entry.meal_type as keyof typeof mealTypeColors]; return (
                  // --- THIS IS THE FIX ---
                  <div key={(entry as DietEntry)._id} className={`p-4 rounded-lg border flex items-start space-x-3 group relative ${colorClass}`}>
                    {Icon && <Icon className="h-5 w-5 flex-shrink-0 mt-1" />}
                    <div>
                      <p className="font-medium text-lg leading-tight">{entry.food_name}</p>
                      <p className="text-xs font-semibold uppercase opacity-80">{entry.meal_type}</p>
                      <p className="text-sm mt-2">{entry.calories} kcal</p>
                      <div className="flex items-center space-x-2 text-xs mt-1">
                        <span className="font-semibold">{entry.protein_g}g P</span>
                        <span className="font-semibold">{entry.carbs_g}g C</span>
                        <span className="font-semibold">{entry.fat_g}g F</span>
                      </div>
                    </div>
                    <button onClick={() => deleteDietEntry((entry as DietEntry)._id)} className="absolute top-2 right-2 p-1 bg-white/50 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                  );})}</div></div>))}</div>
                )}

                {showCreateModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"><div className="flex justify-between items-center border-b pb-3 mb-4"><h2 className="text-2xl font-semibold">Add Food Entry</h2><button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-800"><X className="h-6 w-6" /></button></div><form onSubmit={createDietEntry}><div className="space-y-4"><div><label htmlFor="entry_date" className="block text-sm font-medium text-gray-700">Date</label><input type="date" name="entry_date" id="entry_date" required defaultValue={today} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></div><div><label htmlFor="food_name" className="block text-sm font-medium text-gray-700">Food Name</label><input type="text" name="food_name" id="food_name" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></div><div><label htmlFor="meal_type" className="block text-sm font-medium text-gray-700">Meal Type</label><select name="meal_type" id="meal_type" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"><option value="">Select Meal</option><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></div><div className="grid grid-cols-2 gap-4"><div><label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label><input type="number" name="calories" id="calories" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></div><div><label htmlFor="protein_g" className="block text-sm font-medium text-gray-700">Protein (g)</label><input type="number" name="protein_g" id="protein_g" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></div><div><label htmlFor="carbs_g" className="block text-sm font-medium text-gray-700">Carbs (g)</label><input type="number" name="carbs_g" id="carbs_g" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></div><div><label htmlFor="fat_g" className="block text-sm font-medium text-gray-700">Fat (g)</label><input type="number" name="fat_g" id="fat_g" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></div></div><div><label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label><textarea name="notes" id="notes" rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea></div></div><div className="mt-6 flex justify-end"><button type="button" onClick={() => setShowCreateModal(false)} className="mr-2 px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Save Entry</button></div></form></div></div>
                )}
            </div>
        </Layout>
    );
}