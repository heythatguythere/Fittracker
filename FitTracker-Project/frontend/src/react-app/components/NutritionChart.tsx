import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DietEntry } from '../../shared/types';
import { motion } from 'framer-motion';

// Define the props the component will accept
interface NutritionChartProps {
    dietEntries: DietEntry[];
}

// Use the new props interface
const NutritionChart: React.FC<NutritionChartProps> = ({ dietEntries }) => {
    // Aggregate daily nutrition data from all diet entries
    const aggregateData = dietEntries.reduce((acc, entry) => {
        const date = new Date(entry.entry_date).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        acc[date].calories += entry.calories ?? 0;
        acc[date].protein += entry.protein_g ?? 0;
        acc[date].carbs += entry.carbs_g ?? 0;
        acc[date].fat += entry.fat_g ?? 0;
        return acc;
    }, {} as Record<string, { date: string; calories: number; protein: number; carbs: number; fat: number }>);

    const chartData = Object.values(aggregateData);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/50 p-6 rounded-xl shadow-lg border">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Daily Nutrition Summary</h3>
            <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calories" fill="#8884d8" name="Calories (kcal)" />
                        <Bar dataKey="protein" fill="#82ca9d" name="Protein (g)" />
                        <Bar dataKey="carbs" fill="#ffc658" name="Carbs (g)" />
                        <Bar dataKey="fat" fill="#ff8042" name="Fat (g)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default NutritionChart;