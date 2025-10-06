// In src/react-app/pages/AdminDashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../AuthContext';
import { UserCog, Users, Activity, BarChart2, Settings, LogOut, ShieldCheck, Search } from 'lucide-react';
import type { User } from '../../shared/types';

// --- Helper Stat Card Component ---
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) => {
    const colorClass = `text-${color}-500`;
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
                <Icon className={`h-8 w-8 ${colorClass}`} />
                <div className="ml-4">
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-sm text-gray-500">{title}</p>
                </div>
            </div>
        </div>
    );
};

// --- Main Admin Dashboard Component ---
export default function AdminDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    
    const [activeView, setActiveView] = useState('dashboard'); 
    const [stats, setStats] = useState({ totalUsers: 0, totalWorkouts: 0, newUsersLast7Days: 0 });
    const [users, setUsers] = useState<User[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/login');
            return;
        }

        if (user && user.role === 'admin') {
            const fetchAdminData = async () => {
                setLoadingData(true);
                try {
                    const [statsRes, usersRes] = await Promise.all([
                        axios.get('/api/admin/stats', { withCredentials: true }),
                        axios.get('/api/admin/users', { withCredentials: true })
                    ]);
                    setStats(statsRes.data);
                    setUsers(usersRes.data);
                } catch (error) {
                    console.error("Failed to fetch admin data:", error);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchAdminData();
        }
    }, [user, authLoading, navigate]);

    // --- THIS IS THE FIX ---
    // The handleLogout function is now async. It WAITS for the logout() from
    // the context to complete BEFORE it tries to navigate to the login page.
    const handleLogout = async () => {
        try {
            await logout(); // Wait for the session to be destroyed
            navigate('/login'); // Then navigate
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const filteredUsers = users.filter(u => 
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const chartData = [
        { day: 'Mon', signups: 12 }, { day: 'Tue', signups: 19 }, { day: 'Wed', signups: 8 },
        { day: 'Thu', signups: 22 }, { day: 'Fri', signups: 15 }, { day: 'Sat', signups: 30 },
        { day: 'Sun', signups: 25 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <div className="flex">
                <aside className="w-64 bg-white shadow-md h-screen flex flex-col fixed">
                    <div className="p-6 flex items-center space-x-3 border-b">
                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold">Admin Panel</span>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center p-3 rounded-lg font-semibold text-left transition-colors ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}><BarChart2 className="mr-3" /> Dashboard</button>
                        <button onClick={() => setActiveView('users')} className={`w-full flex items-center p-3 rounded-lg font-semibold text-left transition-colors ${activeView === 'users' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}><Users className="mr-3" /> User Management</button>
                        <button onClick={() => setActiveView('settings')} className={`w-full flex items-center p-3 rounded-lg font-semibold text-left transition-colors ${activeView === 'settings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}><Settings className="mr-3" /> Site Settings</button>
                    </nav>
                    <div className="p-4 border-t">
                         <button onClick={handleLogout} className="w-full flex items-center p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><LogOut className="mr-3" /> Logout</button>
                    </div>
                </aside>

                <main className="flex-1 p-10 ml-64">
                    {activeView === 'dashboard' && (
                        <div>
                            <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
                                <StatCard title="Total Workouts Logged" value={stats.totalWorkouts} icon={Activity} color="green" />
                                <StatCard title="New Users (7 Days)" value={stats.newUsersLast7Days} icon={UserCog} color="purple" />
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
                                    <h2 className="text-2xl font-semibold mb-4">New User Signups (Last 7 Days)</h2>
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="signups" fill="#3B82F6" /></BarChart></ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border">
                                    <h2 className="text-2xl font-semibold mb-4">Recent Registrations</h2>
                                    <ul className="space-y-4">{users.slice(0, 5).map(u => <li key={u._id} className="flex items-center space-x-3"><img src={u.image || `https://ui-avatars.com/api/?name=${u.displayName || u.email}&background=E2E8F0&color=1A202C`} alt="avatar" className="h-10 w-10 rounded-full" /><div><p className="font-semibold">{u.displayName}</p><p className="text-sm text-gray-500">{u.email}</p></div></li>)}</ul>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeView === 'users' && (
                        <div>
                            <h1 className="text-4xl font-bold mb-8">User Management</h1>
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex items-center justify-between mb-4"><h2 className="text-2xl font-semibold">All Users ({filteredUsers.length})</h2><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg" /></div></div>
                                <table className="w-full text-left">
                                    <thead><tr className="border-b bg-gray-50"><th className="p-3">User</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3">Actions</th></tr></thead>
                                    <tbody>{filteredUsers.map(u => <tr key={u._id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 flex items-center space-x-3"><img src={u.image || `https://ui-avatars.com/api/?name=${u.displayName || u.email}`} alt="avatar" className="h-10 w-10 rounded-full" /><span>{u.displayName || 'N/A'}</span></td>
                                        <td className="p-3">{u.email}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{u.role}</span></td>
                                        <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 space-x-2"><button className="text-blue-600 hover:underline">Edit</button><button className="text-red-600 hover:underline">Delete</button></td>
                                    </tr>)}</tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeView === 'settings' && (
                        <div>
                            <h1 className="text-4xl font-bold mb-8">Site Settings</h1>
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h2 className="text-2xl font-semibold mb-4">Application Configuration</h2>
                                <p>Placeholders for site-wide settings, feature flags, API key management, etc., would go here.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};