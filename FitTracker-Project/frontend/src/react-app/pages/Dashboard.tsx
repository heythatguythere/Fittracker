import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Flame, HeartPulse, Share2, Target, Users, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../AuthContext';
import axios from 'axios';
// FIX: Removed unused 'useTheme' import
import AnalyticalReport from '../components/AnalyticalReport';
import SocialShare from '../components/SocialShare';
import AIFitnessCoach from '../components/AIFitnessCoach';
import type { Workout, Measurement, DietEntry, Goal, UserProfile } from '../../shared/types';
import { Link } from 'react-router-dom';

// A simple card component for dashboard stats
const StatCard = ({ icon, title, value, unit }: { icon: React.ReactNode, title: string, value: string | number, unit?: string }) => (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-4">
            {icon}
            <div>
                <p className="text-gray-500 dark:text-gray-400 font-semibold">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value} <span className="text-lg font-medium text-gray-600 dark:text-gray-300">{unit}</span></p>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const { user } = useAuth();
    // FIX: Removed unused 'isDarkMode' variable
    
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [workoutsRes, measurementsRes, dietRes, goalsRes, profileRes] = await Promise.all([
                    axios.get('/api/workouts', { withCredentials: true }),
                    axios.get('/api/measurements', { withCredentials: true }),
                    axios.get('/api/diet', { withCredentials: true }),
                    axios.get('/api/goals', { withCredentials: true }),
                    axios.get('/api/profile', { withCredentials: true }),
                ]);
                setWorkouts(workoutsRes.data);
                setMeasurements(measurementsRes.data);
                setDietEntries(dietRes.data);
                setGoals(goalsRes.data);
                setProfile(profileRes.data);
            } catch (err) {
                setError('Failed to load dashboard data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const recentActivity = useMemo(() => {
        const activities = [
            ...workouts.map(w => ({ type: 'Workout', data: w, date: new Date(w.workout_date) })),
            ...measurements.map(m => ({ type: 'Measurement', data: m, date: new Date(m.measurement_date) })),
            ...dietEntries.map(d => ({ type: 'Diet Entry', data: d, date: new Date(d.entry_date) })),
        ];
        return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
    }, [workouts, measurements, dietEntries]);

    const weeklyWorkouts = useMemo(() => workouts.filter(w => {
        const workoutDate = new Date(w.workout_date);
        const today = new Date();
        const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        return workoutDate >= oneWeekAgo;
    }).length, [workouts]);

    const activeGoals = useMemo(() => goals.filter(g => g.is_active).length, [goals]);

    if (loading) {
        return <Layout><div>Loading...</div></Layout>;
    }
    if (error) {
        return <Layout><div>{error}</div></Layout>;
    }
    
    return (
        <Layout>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-4xl font-bold">Welcome back, {user?.displayName || user?.email}!</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Here's a snapshot of your progress. Keep up the great work!</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<HeartPulse className="h-8 w-8 text-red-500" />} title="Workouts This Week" value={weeklyWorkouts} />
                    <StatCard icon={<Flame className="h-8 w-8 text-orange-500" />} title="Total Calories Burned" value={workouts.reduce((sum, w) => sum + (w.calories_burned ?? 0), 0).toLocaleString()} unit="kcal" />
                    <StatCard icon={<Target className="h-8 w-8 text-green-500" />} title="Active Goals" value={activeGoals} />
                    <StatCard icon={<Users className="h-8 w-8 text-blue-500" />} title="Friends" value={0} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                           <AnalyticalReport workouts={workouts} measurements={measurements} dietEntries={dietEntries} goals={goals} profile={profile} />
                        </motion.div>
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-6">
                            <div className="flex justify-between items-center mb-4">
                               <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI Fitness Coach</h2>
                               <Zap className="h-6 w-6 text-yellow-500" />
                            </div>
                            <AIFitnessCoach />
                        </motion.div>
                    </div>
                    <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50 p-6">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                            {activity.type === 'Workout' && <HeartPulse className="h-5 w-5 text-red-500" />}
                                            {activity.type === 'Measurement' && <BarChart3 className="h-5 w-5 text-purple-500" />}
                                            {activity.type === 'Diet Entry' && <Flame className="h-5 w-5 text-orange-500" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{activity.type}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.date.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <Link to="/workouts" className="mt-6 w-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                View all activity <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                        </motion.div>
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                             <button
                                onClick={() => setIsShareOpen(true)}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
                            >
                                <Share2 className="h-5 w-5"/>
                                <span>Share My Progress</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Social Share Modal */}
            {isShareOpen && (
                <SocialShare
                    workouts={workouts}
                    measurements={measurements}
                    dietEntries={dietEntries}
                    goals={goals}
                    profile={profile}
                    onClose={() => setIsShareOpen(false)}
                />
            )}
        </Layout>
    );
}