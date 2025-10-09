import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Measurement, Goal } from '../../shared/types';
import { motion } from 'framer-motion';

// Define the props the component will accept
interface ProgressChartProps {
    measurements: Measurement[];
    goals: Goal[];
}

// Use the new props interface
const ProgressChart: React.FC<ProgressChartProps> = ({ measurements, goals }) => {
    // Format the measurement data for the chart
    const chartData = measurements.map(m => ({
        date: new Date(m.measurement_date).toLocaleDateString(),
        weight: m.weight_kg,
        bodyFat: m.body_fat_percentage,
    }));

    // Find the current weight goal to display on the chart
    const weightGoal = goals.find(g => g.goal_type === 'weight' && g.is_active)?.target_value;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/50 p-6 rounded-xl shadow-lg border">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Weight & Body Fat Progress</h3>
            <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Body Fat (%)', angle: -90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#8884d8" activeDot={{ r: 8 }} name="Weight (kg)" />
                        <Line yAxisId="right" type="monotone" dataKey="bodyFat" stroke="#82ca9d" name="Body Fat %" />
                        {weightGoal && <Line yAxisId="left" type="monotone" dataKey={() => weightGoal} stroke="red" strokeDasharray="5 5" name="Weight Goal" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ProgressChart;