import { Activity, Chrome, ArrowRight, UserCog, Loader2, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // Ensure path is correct
import { motion } from "framer-motion";

// Note: In a multi-page app, this component would be in its own file and handled by the main router.
// For this project structure, it remains here.
const AdminDashboard = () => { /* ... Admin Dashboard JSX ... */ return <div>Admin Dashboard</div>; };

export default function Login() {
    // const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [isAdminView, setIsAdminView] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const endpoint = isAdminView ? "/auth/admin/login" : (isLoginView ? "/auth/login" : "/auth/register");
        const payload = { email, password };
        
        try {
            const response = await axios.post(endpoint, payload, { withCredentials: true });
            const loggedInUser = response.data.user;

            if (loggedInUser) {
                // --- THIS IS THE CRITICAL FIX ---
                // The ONLY job here is to update the global context.
                // We REMOVE all `Maps` calls from the success path.
                login(loggedInUser);
                
                // The main App.tsx router will now see that the `user` state has changed
                // and will automatically handle redirecting to /dashboard, /admin/dashboard, or /profile.

            } else {
                 setError("Authentication successful, but no user data was returned.");
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || "Authentication failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    // This check is a temporary routing solution for the admin panel.
    if (window.location.pathname === "/admin/dashboard") {
        return <AdminDashboard />;
    }
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-50">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-md">
                 <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-white rounded-full shadow-lg mb-4">
                        <Activity className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isAdminView ? "Admin Access" : (isLoginView ? "Welcome Back" : "Join FitTracker")}
                    </h1>
                    <p className="text-gray-600">
                        {isLoginView ? "Sign in to continue your fitness journey" : "Create your account to get started"}
                    </p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/50"
                >
                    {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">{error}</div>}

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="email" required className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input type="password" required className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-gray-400 flex items-center justify-center">
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLoginView ? "Sign In" : "Sign Up")}
                        </button>
                    </form>

                    {!isAdminView && (
                        <>
                            <div className="flex items-center my-6"><hr className="flex-grow" /><span className="mx-4 text-gray-400 text-sm">OR</span><hr className="flex-grow" /></div>
                            <a href="/auth/google" className="w-full bg-white hover:bg-gray-50 border text-gray-700 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 shadow-sm flex items-center justify-center space-x-3">
                                <Chrome className="h-5 w-5 text-blue-600" /><span>Continue with Google</span><ArrowRight className="h-4 w-4" />
                            </a>
                        </>
                    )}

                    <div className="text-center mt-6">
                        {!isAdminView && (isLoginView ? (
                            <p className="text-sm text-gray-600">Don't have an account? <button onClick={() => { setIsLoginView(false); setError(''); }} className="text-blue-600 hover:underline font-semibold">Sign Up</button></p>
                        ) : (
                            <p className="text-sm text-gray-600">Already have an account? <button onClick={() => { setIsLoginView(true); setError(''); }} className="text-blue-600 hover:underline font-semibold">Sign In</button></p>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-center text-sm text-gray-500">
                            <button onClick={() => { setIsAdminView(!isAdminView); setError(''); }} className="flex items-center space-x-1 hover:text-blue-600">
                                <UserCog className="h-4 w-4" /><span>{isAdminView ? "User Login" : "Admin Login"}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}