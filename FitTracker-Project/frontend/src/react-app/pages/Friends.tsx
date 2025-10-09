import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Search, Trophy, Crown, Medal, Award, Loader2, AlertCircle, Eye, UserMinus, Calendar, Flame, TrendingUp, X, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import type { User, Workout, Measurement, DietEntry } from '../../shared/types';

// --- Types for this component ---
interface Friend extends User { totalWorkouts: number; totalCaloriesBurned: number; weeklyWorkouts: number; isCurrentUser: boolean; }
interface FriendRequest extends Pick<User, '_id' | 'displayName' | 'email' | 'image'> {}
interface FriendProgress { friend: FriendRequest; workouts: Workout[]; measurements: Measurement[]; dietEntries: DietEntry[]; }

export default function Friends() {
    const [incoming, setIncoming] = useState<FriendRequest[]>([]);
    const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
    const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
    const [selectedFriend, setSelectedFriend] = useState<FriendProgress | null>(null);
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [friendEmail, setFriendEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    useEffect(() => { fetchFriendsData(); }, []);

    const fetchFriendsData = async () => {
        setLoading(true);
        try {
            // --- THIS IS THE FIX ---
            // We now fetch requests and leaderboard data from their correct, separate endpoints.
            const [friendsAndRequestsRes, leaderboardRes] = await Promise.all([
                axios.get('/api/friends', { withCredentials: true }),
                axios.get('/api/friends/leaderboard', { withCredentials: true })
            ]);
            
            // Destructure the response from the corrected /api/friends endpoint
            setIncoming(friendsAndRequestsRes.data.incomingRequests || []);
            setOutgoing(friendsAndRequestsRes.data.outgoingRequests || []);
            
            setLeaderboard(leaderboardRes.data || []);

        } catch (error) {
            console.error('Error fetching friends data:', error);
            setActionError('Failed to load friends data');
        } finally {
            setLoading(false);
        }
    };

    const handleApiAction = async (action: () => Promise<any>, successMessage: string, errorMessage: string) => {
        setActionError(null); setActionSuccess(null);
        try {
            await action();
            setActionSuccess(successMessage);
            fetchFriendsData();
        } catch (err: any) {
            setActionError(err.response?.data?.error || errorMessage);
        } finally {
            setTimeout(() => { setActionError(null); setActionSuccess(null); }, 4000);
        }
    };

    const addFriend = () => { if (friendEmail.trim()) { handleApiAction(() => axios.post('/api/friends/request', { email: friendEmail }, { withCredentials: true }), 'Friend request sent!', 'Failed to send request.'); setShowAddFriend(false); setFriendEmail(''); }};
    const acceptRequest = (id: string) => handleApiAction(() => axios.post(`/api/friends/requests/${id}/accept`, {}, { withCredentials: true }), 'Friend request accepted!', 'Failed to accept request.');
    const declineRequest = (id: string) => handleApiAction(() => axios.post(`/api/friends/requests/${id}/decline`, {}, { withCredentials: true }), 'Friend request declined.', 'Failed to decline request.');
    const cancelOutgoing = (id: string) => handleApiAction(() => axios.delete(`/api/friends/cancel/${id}`, { withCredentials: true }), 'Friend request canceled.', 'Failed to cancel request.');
    const removeFriend = (id: string) => { if (window.confirm("Are you sure?")) handleApiAction(() => axios.delete(`/api/friends/remove/${id}`, { withCredentials: true }), 'Friend removed.', 'Failed to remove friend.'); };
    
    const viewFriendProgress = async (friendId: string) => { try { const response = await axios.get(`/api/friends/${friendId}/progress`, { withCredentials: true }); setSelectedFriend(response.data); } catch (error) { setActionError('Failed to load friend progress'); } };
    const getRankIcon = (index: number) => { if (index === 0) return <Crown className="h-6 w-6 text-yellow-500" />; if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />; if (index === 2) return <Award className="h-6 w-6 text-amber-600" />; return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>; };
    
    const friendsList = leaderboard.filter(u => !u.isCurrentUser);

    if (loading) { return <Layout><div className="flex items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div></Layout>; }

    return (
        <Layout>
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div><h1 className="text-4xl font-bold flex items-center"><Users className="h-10 w-10 mr-3 text-blue-600" />Friends</h1><p className="text-gray-600 mt-2">Connect with friends and compete on the leaderboard</p></div>
                    <motion.button onClick={() => setShowAddFriend(true)} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><UserPlus className="h-5 w-5" /><span>Add Friend</span></motion.button>
                </motion.div>

                <AnimatePresence>{actionError && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"><AlertCircle className="h-5 w-5 text-red-500" /><span className="text-red-700">{actionError}</span><button onClick={() => setActionError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button></motion.div>)}</AnimatePresence>
                <AnimatePresence>{actionSuccess && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3"><ShieldCheck className="h-5 w-5 text-green-500" /><span className="text-green-700">{actionSuccess}</span><button onClick={() => setActionSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">×</button></motion.div>)}</AnimatePresence>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Friend Requests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3">Incoming ({incoming.length})</h3>
                            {incoming.length === 0 ? <p className="text-gray-500 text-sm">No incoming requests</p> : <div className="space-y-3">{incoming.map((u) => (<div key={u._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3"><div className="flex items-center space-x-3"><img src={(u.image ?? undefined) || `https://ui-avatars.com/api/?name=${u.displayName || u.email}`} alt={u.displayName || 'user'} className="w-10 h-10 rounded-full" /><div><p className="font-medium text-gray-900">{u.displayName || u.email}</p></div></div><div className="flex items-center space-x-2"><button onClick={() => acceptRequest(u._id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Accept</button><button onClick={() => declineRequest(u._id)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300">Decline</button></div></div>))}</div>}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3">Outgoing ({outgoing.length})</h3>
                            {outgoing.length === 0 ? <p className="text-gray-500 text-sm">No outgoing requests</p> : <div className="space-y-3">{outgoing.map((u) => (<div key={u._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3"><div className="flex items-center space-x-3"><img src={(u.image ?? undefined) || `https://ui-avatars.com/api/?name=${u.displayName || u.email}`} alt={u.displayName || 'user'} className="w-10 h-10 rounded-full" /><div><p className="font-medium text-gray-900">{u.displayName || u.email}</p></div></div><div className="flex items-center space-x-2"><button onClick={() => cancelOutgoing(u._id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200">Cancel</button></div></div>))}</div>}
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><Users className="h-6 w-6 mr-2 text-blue-600" />My Friends ({friendsList.length})</h2>
                    {friendsList.length === 0 ? (<div className="text-center py-12"><Users className="h-16 w-16 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-semibold text-gray-600 mb-2">No friends yet</h3><p className="text-gray-500 mb-4">Add friends by their email to start competing!</p><button onClick={() => setShowAddFriend(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Your First Friend</button></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{friendsList.map((friend) => (<motion.div key={friend._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl p-4 shadow-md border hover:shadow-lg transition-all"><div className="flex items-center space-x-3 mb-3"><img src={(friend.image ?? undefined) || `https://ui-avatars.com/api/?name=${friend.displayName || friend.email}`} alt={friend.displayName || 'friend'} className="w-12 h-12 rounded-full object-cover" /><div className="flex-1"><h3 className="font-semibold text-gray-900">{friend.displayName || friend.email}</h3></div><button onClick={() => removeFriend(friend._id)} className="p-2 text-gray-400 hover:text-red-500"><UserMinus className="h-4 w-4" /></button></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-600">Workouts:</span><span className="font-semibold">{friend.totalWorkouts}</span></div><div className="flex justify-between"><span className="text-gray-600">Calories:</span><span className="font-semibold">{friend.totalCaloriesBurned.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-gray-600">This Week:</span><span className="font-semibold">{friend.weeklyWorkouts}</span></div></div><button onClick={() => viewFriendProgress(friend._id)} className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Eye className="h-4 w-4" /><span>View Progress</span></button></motion.div>))}</div>)}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><Trophy className="h-6 w-6 mr-2 text-yellow-600" />Leaderboard</h2>
                    <div className="space-y-4">{leaderboard.map((user, index) => (<motion.div key={user._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className={`flex items-center space-x-4 p-4 rounded-xl ${user.isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}><div className="flex-shrink-0 w-8 text-center">{getRankIcon(index)}</div><img src={(user.image ?? undefined) || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} alt={user.displayName || 'user'} className="w-12 h-12 rounded-full object-cover" /><div className="flex-1"><div className="flex items-center space-x-2"><h3 className="font-semibold">{user.displayName || user.email}</h3>{user.isCurrentUser && (<span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>)}</div><div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600"><span className="flex items-center space-x-1"><TrendingUp size={16} /><span>{user.totalWorkouts}</span></span><span className="flex items-center space-x-1"><Flame size={16} /><span>{user.totalCaloriesBurned.toLocaleString()}</span></span><span className="flex items-center space-x-1"><Calendar size={16} /><span>{user.weeklyWorkouts} this week</span></span></div></div></motion.div>))}</div>
                </motion.div>
                
                 <AnimatePresence>{showAddFriend && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddFriend(false)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}><h3 className="text-xl font-bold mb-4">Add Friend</h3><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} placeholder="Enter friend's email address" className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div><div className="flex space-x-3"><button onClick={addFriend} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send Request</button><button onClick={() => setShowAddFriend(false)} className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button></div></motion.div></motion.div> )}
                </AnimatePresence>
                <AnimatePresence>{selectedFriend && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFriend(null)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between p-6 border-b"><div className="flex items-center space-x-3"><img src={(selectedFriend.friend.image ?? undefined) || `https://ui-avatars.com/api/?name=${selectedFriend.friend.displayName || selectedFriend.friend.email}`} alt={selectedFriend.friend.displayName || 'friend'} className="w-12 h-12 rounded-full" /><div><h2 className="text-2xl font-bold">{selectedFriend.friend.displayName}'s Progress</h2><p className="text-gray-600">{selectedFriend.friend.email}</p></div></div><button onClick={() => setSelectedFriend(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X/></button></div><div className="p-6 overflow-y-auto"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div><h3 className="text-lg font-semibold mb-4">Recent Workouts</h3><div className="space-y-2">{selectedFriend.workouts.slice(0,5).map(w => <div key={w._id} className="bg-gray-50 rounded-lg p-3"><h4 className="font-medium">{w.name}</h4><p className="text-sm text-gray-600">{new Date(w.workout_date).toLocaleDateString()}</p><p className="text-sm text-blue-600">{w.calories_burned} calories</p></div>)}</div></div><div><h3 className="text-lg font-semibold mb-4">Recent Measurements</h3><div className="space-y-2">{selectedFriend.measurements.slice(0,5).map(m => <div key={m._id} className="bg-gray-50 rounded-lg p-3"><p className="font-medium">{m.weight_kg} kg</p><p className="text-sm text-gray-600">{new Date(m.measurement_date).toLocaleDateString()}</p></div>)}</div></div><div><h3 className="text-lg font-semibold mb-4">Recent Diet</h3><div className="space-y-2">{selectedFriend.dietEntries.slice(0,5).map(e => <div key={e._id} className="bg-gray-50 rounded-lg p-3"><h4 className="font-medium">{e.food_name}</h4><p className="text-sm text-gray-600">{e.calories} calories</p><p className="text-sm text-gray-500">{new Date(e.entry_date).toLocaleDateString()}</p></div>)}</div></div></div></div></motion.div></motion.div> )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}