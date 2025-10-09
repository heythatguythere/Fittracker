import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import Layout from "../components/Layout";
import AnalyticalReport from "../components/AnalyticalReport";
import SocialShare from "../components/SocialShare";
import { 
    TrendingUp, 
    Dumbbell, 
    Target, 
    Weight, 
    Loader2, 
    ShieldAlert,
    PlusCircle,
    ClipboardList,
    BarChart3,
    X,
    Share2
} from "lucide-react";
import axios from "axios";
import type { UserProfile, Workout, Measurement, DietEntry, Goal, WorkoutTemplate } from "../../shared/types";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { motion, AnimatePresence } from "framer-motion";

// Reusable Stat Card Component
const StatCard = ({ icon, title, value, color, delay, isDarkMode }: { icon: ReactNode, title: string, value: string | number, color: string, delay: number, isDarkMode: boolean }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className={`backdrop-blur-xl p-6 rounded-2xl shadow-lg border flex items-center space-x-4 transition-transform hover:scale-105 hover:shadow-xl ${
            isDarkMode 
                ? 'bg-gray-800/60 border-gray-700/50' 
                : 'bg-white/60 border-white/50'
        }`}
    >
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [summary, setSummary] = useState<{ totalWorkouts: number; streak: number; latestWeight: number | null } | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
    const [recentMeasurements, setRecentMeasurements] = useState<Measurement[]>([]);
    const [recentDietEntries, setRecentDietEntries] = useState<DietEntry[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportData, setReportData] = useState<string | null>(null);
    const [showAnalyticalReport, setShowAnalyticalReport] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !authLoading) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await Promise.all([
                        axios.get("/api/dashboard-summary", { withCredentials: true }),
                        axios.get("/api/profile", { withCredentials: true }),
                        axios.get("/api/workouts", { withCredentials: true }),
                        axios.get("/api/measurements", { withCredentials: true }),
                        axios.get("/api/diet", { withCredentials: true }),
                        axios.get("/api/goals", { withCredentials: true }),
                        axios.get("/api/templates", { withCredentials: true }),
                    ]);
                    setSummary(res[0].data);
                    setProfile(res[1].data);
                    setRecentWorkouts(res[2].data);
                    setRecentMeasurements(res[3].data);
                    setRecentDietEntries(res[4].data);
                    setGoals(res[5].data);
                    setTemplates(res[6].data);
                } catch (error) { 
                    console.error("Failed to fetch dashboard data:", error);
                    setError("Failed to load dashboard data. Please try refreshing the page.");
                } 
                finally { setLoading(false); }
            };
            fetchData();
        } else if (!authLoading && !user) {
            setLoading(false); // If there's no user, stop loading
        }
    }, [user, authLoading]);

    const generateReport = async () => {
        setLoadingReport(true);
        setReportData(null);
        try {
            const payload = { profile, workouts: recentWorkouts, measurements: recentMeasurements, dietEntries: recentDietEntries };
            const response = await axios.post("/api/generate-report", payload, { withCredentials: true });
            const formattedHtml = marked.parse(response.data.report || 'Could not generate report.') as string;
            setReportData(formattedHtml);
        } catch (error) {
            console.error("Failed to generate report:", error);
            setReportData("<p>Failed to generate report. Please try again.</p>");
        } finally {
            setLoadingReport(false);
        }
    };
    

    if (loading || authLoading) {
        return <Layout><div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>;
    }

    if (error) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-5xl font-bold text-gray-900">
                        Welcome back, <span className="text-blue-600">{profile?.first_name || "User"}</span>!
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Here's your progress at a glance.</p>
                </motion.div>
                
                {(!profile?.first_name) && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="bg-yellow-100/80 backdrop-blur-xl text-yellow-900 border-l-4 border-yellow-500 p-4 rounded-lg flex items-center space-x-4">
                            <ShieldAlert className="h-6 w-6"/>
                            <div><p className="font-bold">Complete Your Profile!</p><p className="text-sm">Fill out your profile details for personalized insights. <button onClick={() => navigate('/profile')} className="font-semibold underline">Go to Profile</button></p></div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<TrendingUp className="h-6 w-6 text-blue-600" />} title="Workout Streak" value={`${summary?.streak || 0} Days`} color="bg-blue-100" delay={0.1} isDarkMode={isDarkMode} />
                    <StatCard icon={<Dumbbell className="h-6 w-6 text-green-600" />} title="Total Workouts" value={summary?.totalWorkouts || 0} color="bg-green-100" delay={0.2} isDarkMode={isDarkMode} />
                    <StatCard icon={<Weight className="h-6 w-6 text-purple-600" />} title="Latest Weight" value={summary?.latestWeight ? `${summary.latestWeight} kg` : "N/A"} color="bg-purple-100" delay={0.3} isDarkMode={isDarkMode} />
                    <StatCard icon={<Target className="h-6 w-6 text-red-600" />} title="Calorie Goal" value={profile?.calorie_goal ? `${profile.calorie_goal} kcal` : "Not Set"} color="bg-red-100" delay={0.4} isDarkMode={isDarkMode} />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
                       <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan Your Next Session</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => navigate('/workouts')} className="p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center"><PlusCircle className="h-10 w-10 text-blue-600 mx-auto mb-2" /><span className="font-semibold text-blue-800">Start Blank Workout</span></button>
                            <button onClick={() => navigate('/workouts/templates')} className="p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center"><ClipboardList className="h-10 w-10 text-purple-600 mx-auto mb-2" /><span className="font-semibold text-purple-800">Manage Templates</span></button>
                       </div>
                       {templates && templates.length > 0 && (
                           <div className="mt-6"><h3 className="font-semibold text-gray-700 mb-3">Quick Start:</h3><div className="flex flex-wrap gap-2">{templates.slice(0, 3).map(t => (<button key={t._id} onClick={() => navigate(`/workouts?template=${t._id}`)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-medium">{t.name}</button>))}</div></div>
                       )}
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-lg p-6 flex flex-col">
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Fitness Reports</h2>
                                    <p className="text-gray-400">Get comprehensive insights on your progress.</p>
                                </div>
                                {reportData && (
                                    <motion.button
                                        onClick={() => setShowShareModal(true)}
                                        className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Share2 className="h-4 w-4" />
                                        <span className="text-sm">Share</span>
                                    </motion.button>
                                )}
                            </div>
                            {reportData && <div className="prose prose-invert max-w-none mt-4 border-t border-gray-700 pt-4" dangerouslySetInnerHTML={{ __html: reportData }} />}
                        </div>
                        <div className="space-y-3">
                            <button 
                                onClick={() => setShowAnalyticalReport(true)} 
                                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                            >
                                <BarChart3 className="h-5 w-5 mr-2" />
                                View Analytical Report
                            </button>
                            <button onClick={generateReport} disabled={loadingReport} className="w-full flex items-center justify-center px-4 py-3 bg-white/10 hover:bg-white/20 font-semibold rounded-lg transition-colors disabled:opacity-50">
                                {loadingReport ? (<><Loader2 className="h-5 w-5 animate-spin mr-2" /> Generating...</>) : (<>Generate Text Report</>)}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {showAnalyticalReport && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAnalyticalReport(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">Analytical Fitness Report</h2>
                                <button
                                    onClick={() => setShowAnalyticalReport(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="overflow-y-auto">
                                <AnalyticalReport
                                    profile={profile}
                                    workouts={recentWorkouts}
                                    measurements={recentMeasurements}
                                    dietEntries={recentDietEntries}
                                    goals={goals}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SocialShare
                profile={profile}
                workouts={recentWorkouts}
                measurements={recentMeasurements}
                dietEntries={recentDietEntries}
                goals={goals}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </Layout>
    ); 
}