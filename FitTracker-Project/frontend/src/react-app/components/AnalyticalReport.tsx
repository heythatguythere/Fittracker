import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Target, HeartPulse, Flame, Cake, Info } from 'lucide-react';
import type { Workout, Measurement, DietEntry, Goal, UserProfile } from '../../shared/types';

interface AnalyticalReportProps {
    workouts: Workout[];
    measurements: Measurement[];
    dietEntries: DietEntry[];
    goals: Goal[];
    profile: UserProfile | null;
}

export default function AnalyticalReport({ workouts, measurements, dietEntries, goals, profile }: AnalyticalReportProps) {
    const analytics = useMemo(() => {
        const totalWorkouts = workouts.length;
        const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned ?? 0), 0);
        
        // --- THIS IS THE FIX ---
        // Added defensive checks to prevent crashing on empty arrays
        const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;
        const initialMeasurement = measurements.length > 0 ? measurements[0] : null;
        // --- END OF FIX ---

        const weightChange = latestMeasurement && initialMeasurement ? (latestMeasurement.weight_kg ?? 0) - (initialMeasurement.weight_kg ?? 0) : 0;
        
        const latestBmi = latestMeasurement && profile?.height_cm ? ((latestMeasurement.weight_kg ?? 0) / Math.pow(profile.height_cm / 100, 2)) : 0;
        
        const avgDailyCalories = dietEntries.length > 0 ? dietEntries.reduce((sum, d) => sum + (d.calories ?? 0), 0) / new Set(dietEntries.map(d => new Date(d.entry_date).toDateString())).size : 0;
        
        const macronutrients = dietEntries.reduce((acc, d) => {
            acc.protein += d.protein_g ?? 0;
            acc.carbs += d.carbs_g ?? 0;
            acc.fat += d.fat_g ?? 0;
            return acc;
        }, { protein: 0, carbs: 0, fat: 0 });

        const activeGoals = goals.filter(g => g.is_active).length;
        return { totalWorkouts, totalCaloriesBurned, weightChange, latestBmi, avgDailyCalories, macronutrients, activeGoals };
    }, [workouts, measurements, dietEntries, goals, profile]);

    const macroPieData = [
        { name: 'Protein', value: analytics.macronutrients.protein },
        { name: 'Carbs', value: analytics.macronutrients.carbs },
        { name: 'Fat', value: analytics.macronutrients.fat }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    const StatCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string | number, unit?: string }) => (
        <div className="bg-white/50 p-6 rounded-xl shadow-lg border flex items-start space-x-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">{icon}</div>
            <div>
                <p className="text-gray-600 font-semibold">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value} <span className="text-lg font-medium text-gray-500">{unit}</span></p>
            </div>
        </div>
    );

    if (workouts.length === 0 && measurements.length === 0 && dietEntries.length === 0) {
        return (
             <div className="p-6 bg-gray-50 rounded-2xl border text-center">
                 <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <h2 className="text-xl font-bold text-gray-800 mb-2">No Data for Analysis</h2>
                 <p className="text-gray-600">Start logging your activities to see your report.</p>
             </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<HeartPulse />} title="Total Workouts" value={analytics.totalWorkouts} />
                <StatCard icon={<Flame />} title="Calories Burned" value={analytics.totalCaloriesBurned.toLocaleString()} unit="kcal" />
                <StatCard icon={<TrendingUp />} title="Weight Change" value={analytics.weightChange.toFixed(1)} unit="kg" />
                <StatCard icon={<Cake />} title="Avg. Daily Calories" value={analytics.avgDailyCalories.toFixed(0)} unit="kcal" />
                <StatCard icon={<Target />} title="Active Goals" value={analytics.activeGoals} />
                <StatCard icon={<Info />} title="Latest BMI" value={analytics.latestBmi > 0 ? analytics.latestBmi.toFixed(1) : 'N/A'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-white/50 p-6 rounded-xl shadow-lg border h-96">
                     <h3 className="font-bold text-lg mb-4">Macronutrient Distribution (g)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={macroPieData}
                                cx="50%"
                                cy="40%" // Adjusted to make space for Legend at the bottom
                                innerRadius={70}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                paddingAngle={5}
                            >
                                {macroPieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend />
                         </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}