import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Workout, Measurement, DietEntry, Goal, UserProfile } from '../../shared/types';
import AnalyticalReport from '../components/AnalyticalReport';
import ProgressChart from '../components/ProgressChart';
import NutritionChart from '../components/NutritionChart';
import AIFitnessCoach from '../components/AIFitnessCoach';
import WorkoutAnalytics from '../components/WorkoutAnalytics';
import api from '../api'; // IMPORT our new configured api client

export default function Dashboard() {
    const { user } = useAuth();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // USE the new 'api' client to fetch all data in parallel
                const [workoutsRes, measurementsRes, dietRes, goalsRes, profileRes] = await Promise.all([
                    api.get('/api/workouts'),
                    api.get('/api/measurements'),
                    api.get('/api/diet'),
                    api.get('/api/goals'),
                    api.get('/api/profile'),
                ]);

                setWorkouts(workoutsRes.data);
                setMeasurements(measurementsRes.data);
                setDietEntries(dietRes.data);
                setGoals(goalsRes.data);
                setProfile(profileRes.data);
                setError(null);
            } catch (err) {
                setError('Failed to load dashboard data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="p-4">Loading dashboard...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-50/50">
            <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.displayName ?? 'User'}!</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <AnalyticalReport
                        workouts={workouts}
                        measurements={measurements}
                        dietEntries={dietEntries}
                        goals={goals}
                        profile={profile}
                    />
                    <WorkoutAnalytics workouts={workouts} />
                    <ProgressChart measurements={measurements} goals={goals} />
                    <NutritionChart dietEntries={dietEntries} />
                </div>
                <div className="lg:col-span-1">
                    <AIFitnessCoach />
                </div>
            </div>
        </div>
    );
}