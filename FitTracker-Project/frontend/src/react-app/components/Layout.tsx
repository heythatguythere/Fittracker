// In src/react-app/components/Layout.tsx

import { ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { BarChart3, Dumbbell, Apple, Weight, User, LogOut, Shield, FileText, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import AIFitnessCoach from './AIFitnessCoach';
import axios from 'axios';
import type { UserProfile, Workout } from '../../shared/types';

// Helper for NavLink styling
const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
    }`;

export default function Layout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

    // Fetch user data for AI coach
    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const [profileRes, workoutsRes] = await Promise.all([
                axios.get('/api/profile', { withCredentials: true }),
                axios.get('/api/workouts', { withCredentials: true })
            ]);
            setUserProfile(profileRes.data);
            setRecentWorkouts(workoutsRes.data.slice(0, 10)); // Last 10 workouts
        } catch (error) {
            console.error('Failed to fetch user data for AI coach:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-0 -left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
                <div className="absolute top-0 -right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative flex min-h-screen">
                {/* --- Sidebar --- */}
                <motion.aside 
                    initial={{ x: -256 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/50 shadow-lg flex flex-col fixed h-full z-20"
                >
                    <div className="p-6 border-b border-gray-200/50">
                        <h1 className="text-2xl font-bold text-gray-900">FitTracker</h1>
                        <p className="text-sm text-gray-500">Welcome, {user?.displayName || 'User'}</p>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 font-semibold">
                        <NavLink to="/dashboard" className={navLinkClasses}><BarChart3 size={20} /><span>Dashboard</span></NavLink>
                        <NavLink to="/workouts" className={navLinkClasses}><Dumbbell size={20} /><span>Workouts</span></NavLink>
                        <NavLink to="/diet" className={navLinkClasses}><Apple size={20} /><span>Diet</span></NavLink>
                        <NavLink to="/measurements" className={navLinkClasses}><Weight size={20} /><span>Measurements</span></NavLink>
                        <NavLink to="/friends" className={navLinkClasses}><Users size={20} /><span>Friends</span></NavLink>
                        <NavLink to="/workouts/templates" className={navLinkClasses}><FileText size={20} /><span>Templates</span></NavLink>
                        <NavLink to="/profile" className={navLinkClasses}><User size={20} /><span>Profile</span></NavLink>
                        {user?.role === 'admin' && (
                            <NavLink to="/admin/dashboard" className={navLinkClasses}><Shield size={20} /><span>Admin Panel</span></NavLink>
                        )}
                    </nav>

                    <div className="p-4 border-t border-gray-200/50">
                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 font-semibold hover:bg-red-50 hover:text-red-700 transition-colors">
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </motion.aside>

                {/* --- Main Content Area --- */}
                <main className="flex-1 ml-64">
                    <div className="p-4 sm:p-6 lg:p-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* AI Fitness Coach - Floating Chat Widget */}
            <AIFitnessCoach 
                userProfile={userProfile}
                recentWorkouts={recentWorkouts}
            />
        </div>
    );
}