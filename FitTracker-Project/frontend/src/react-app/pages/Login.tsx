import { useState, FormEvent } from 'react';
import { useAuth } from '../AuthContext';
import { motion, Variants } from 'framer-motion';
import { LogIn, UserPlus, Mail, Key, Loader2, AlertCircle } from 'lucide-react';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function Login() {
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, displayName);
            }
            // Navigation is handled by the AuthContext, so no 'navigate' call is needed here.
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    const handleOAuth = (provider: 'google' | 'github') => {
        window.location.href = `/api/auth/${provider}`;
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.5, ease: "easeOut" } 
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
            <motion.div 
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
                    <p className="text-gray-600 mt-2">
                        {isLogin ? 'Login to continue your fitness journey.' : 'Sign up to start tracking your progress.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5"/>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            <input
                                type="text"
                                placeholder="Display Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin"/> : (isLogin ? <><LogIn className="h-5 w-5 mr-2"/> Login</> : <><UserPlus className="h-5 w-5 mr-2"/> Sign Up</>)}
                    </button>
                </form>

                <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500">Or continue with</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => handleOAuth('google')} className="w-full flex items-center justify-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition">
                        <span className="mr-2 text-red-500"><FaGoogle /></span> Google
                    </button>
                    <button onClick={() => handleOAuth('github')} className="w-full flex items-center justify-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition">
                        <span className="mr-2 text-gray-800"><FaGithub /></span> GitHub
                    </button>
                </div>

                <p className="text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => setIsLogin(!isLogin)} className="font-semibold text-blue-600 hover:underline ml-1">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}