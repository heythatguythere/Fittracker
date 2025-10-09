import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { User, Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import { UserProfile } from '../../shared/types'; // Corrected import path

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/profile', { withCredentials: true });
                setProfile(res.data);
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const res = await axios.put('/api/profile', profile, { withCredentials: true });
            setProfile(res.data);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <Layout><div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>;
    }

    return (
        <Layout>
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-8"
            >
                <div>
                    <h1 className="text-4xl font-bold flex items-center"><User className="h-10 w-10 mr-3 text-blue-600" /> My Profile</h1>
                    <p className="text-gray-600 mt-2">Update your personal information and preferences.</p>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"><AlertCircle className="h-5 w-5 mr-2"/>{error}</div>}
                {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center space-x-6">
                            <img 
                                src={user?.image || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}`} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                            />
                            <div>
                                <h2 className="text-2xl font-bold">{user?.displayName || user?.email}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" name="first_name" value={profile.first_name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" name="last_name" value={profile.last_name || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input type="date" name="date_of_birth" value={profile.date_of_birth?.split('T')[0] || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                <input type="number" name="height_cm" value={profile.height_cm || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fitness Goals</label>
                            <textarea name="fitness_goals" value={profile.fitness_goals || ''} onChange={handleChange} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>
                        
                        <div className="pt-6 border-t text-right">
                             <motion.button 
                                type="submit" 
                                disabled={saving}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <Save className="h-5 w-5 mr-2"/>}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 }}
                    className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-8"
                >
                     <h2 className="text-2xl font-bold flex items-center mb-4"><Settings className="h-8 w-8 mr-3 text-blue-600" />Settings</h2>
                     <p className="text-gray-600">Account settings and preferences will be available here in a future update.</p>
                </motion.div>
            </motion.div>
        </Layout>
    );
}