import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Weight, 
  Calendar,
  Eye,
  UserMinus,
  Crown,
  Medal,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import axios from 'axios';
import type { UserProfile, Workout, Measurement, DietEntry } from '../../shared/types';

interface Friend {
  _id: string;
  displayName: string;
  email: string;
  image?: string;
  totalWorkouts: number;
  totalCaloriesBurned: number;
  weeklyWorkouts: number;
  latestWeight?: number;
  weightChange: number;
  isCurrentUser: boolean;
}

interface FriendProgress {
  friend: {
    _id: string;
    displayName: string;
    email: string;
    image?: string;
  };
  workouts: Workout[];
  measurements: Measurement[];
  dietEntries: DietEntry[];
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendProgress | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showFriendProgress, setShowFriendProgress] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsRes, leaderboardRes] = await Promise.all([
        axios.get('/api/friends', { withCredentials: true }),
        axios.get('/api/friends/leaderboard', { withCredentials: true })
      ]);
      setFriends(friendsRes.data.friends || []);
      setIncoming(friendsRes.data.incomingRequests || []);
      setOutgoing(friendsRes.data.outgoingRequests || []);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching friends data:', error);
      setError('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async () => {
    if (!friendEmail.trim()) return;
    
    try {
      await axios.post('/api/friends/request', 
        { email: friendEmail }, 
        { withCredentials: true }
      );
      setFriendEmail('');
      setShowAddFriend(false);
      fetchFriendsData(); // Refresh leaderboard
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to add friend');
    }
  };

  const acceptRequest = async (requesterId: string) => {
    try {
      await axios.post(`/api/friends/requests/${requesterId}/accept`, {}, { withCredentials: true });
      fetchFriendsData();
    } catch (error) {
      setError('Failed to accept request');
    }
  };

  const declineRequest = async (requesterId: string) => {
    try {
      await axios.post(`/api/friends/requests/${requesterId}/decline`, {}, { withCredentials: true });
      fetchFriendsData();
    } catch (error) {
      setError('Failed to decline request');
    }
  };

  const cancelOutgoing = async (recipientId: string) => {
    try {
      await axios.post(`/api/friends/cancel/${recipientId}`, {}, { withCredentials: true });
      fetchFriendsData();
    } catch (error) {
      setError('Failed to cancel request');
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await axios.delete(`/api/friends/remove/${friendId}`, { withCredentials: true });
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
      fetchFriendsData(); // Refresh leaderboard
    } catch (error) {
      setError('Failed to remove friend');
    }
  };

  const viewFriendProgress = async (friendId: string) => {
    try {
      const response = await axios.get(`/api/friends/${friendId}/progress`, { withCredentials: true });
      setSelectedFriend(response.data);
      setShowFriendProgress(true);
    } catch (error) {
      setError('Failed to load friend progress');
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2: return 'bg-gradient-to-r from-amber-500 to-amber-700';
      default: return 'bg-gradient-to-r from-blue-500 to-purple-600';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <Users className="h-10 w-10 mr-3 text-blue-600" />
              Friends
            </h1>
            <p className="text-gray-600 mt-2">Connect with friends and compete on the leaderboard</p>
          </div>
          <motion.button
            onClick={() => setShowAddFriend(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Friend</span>
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Friend Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Incoming</h3>
              {incoming.length === 0 ? (
                <p className="text-gray-500 text-sm">No incoming requests</p>
              ) : (
                <div className="space-y-3">
                  {incoming.map((u) => (
                    <div key={u._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <img src={u.image || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-900">{u.displayName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => acceptRequest(u._id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">Accept</button>
                        <button onClick={() => declineRequest(u._id)} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Outgoing</h3>
              {outgoing.length === 0 ? (
                <p className="text-gray-500 text-sm">No outgoing requests</p>
              ) : (
                <div className="space-y-3">
                  {outgoing.map((u) => (
                    <div key={u._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <img src={u.image || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium text-gray-900">{u.displayName}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => cancelOutgoing(u._id)} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200">Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-600" />
            My Friends ({friends.length})
          </h2>
          
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No friends yet</h3>
              <p className="text-gray-500 mb-4">Add friends by their email to start competing!</p>
              <button
                onClick={() => setShowAddFriend(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Friend
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={friend.image || '/default-avatar.png'}
                      alt={friend.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{friend.displayName}</h3>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                    <button
                      onClick={() => removeFriend(friend._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Workouts:</span>
                      <span className="font-semibold">{friend.totalWorkouts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-semibold">{friend.totalCaloriesBurned.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Week:</span>
                      <span className="font-semibold">{friend.weeklyWorkouts}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => viewFriendProgress(friend._id)}
                    className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Progress</span>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
            Leaderboard
          </h2>
          
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-xl ${
                  user.isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                
                <img
                  src={user.image || '/default-avatar.png'}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                    {user.isCurrentUser && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>
                    )}
                  </div>
                  <div className="flex space-x-6 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{user.totalWorkouts} workouts</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Flame className="h-4 w-4" />
                      <span>{user.totalCaloriesBurned.toLocaleString()} cal</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{user.weeklyWorkouts} this week</span>
                    </span>
                  </div>
                </div>
                
                {!user.isCurrentUser && (
                  <button
                    onClick={() => viewFriendProgress(user._id)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add Friend Modal */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddFriend(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Friend</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Friend's Email
                  </label>
                  <input
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="Enter friend's email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={addFriend}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Friend
                  </button>
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friend Progress Modal */}
      <AnimatePresence>
        {showFriendProgress && selectedFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFriendProgress(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedFriend.friend.image || '/default-avatar.png'}
                    alt={selectedFriend.friend.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedFriend.friend.displayName}'s Progress</h2>
                    <p className="text-gray-600">{selectedFriend.friend.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFriendProgress(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Recent Workouts */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h3>
                    <div className="space-y-2">
                      {selectedFriend.workouts.slice(0, 5).map((workout) => (
                        <div key={workout._id} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900">{workout.name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(workout.workout_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-blue-600">
                            {workout.calories_burned} calories
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Measurements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Measurements</h3>
                    <div className="space-y-2">
                      {selectedFriend.measurements.slice(0, 5).map((measurement) => (
                        <div key={measurement._id} className="bg-gray-50 rounded-lg p-3">
                          <p className="font-medium text-gray-900">
                            {measurement.weight_kg} kg
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(measurement.measurement_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Diet Entries */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Diet</h3>
                    <div className="space-y-2">
                      {selectedFriend.dietEntries.slice(0, 5).map((entry) => (
                        <div key={entry._id} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900">{entry.food_name}</h4>
                          <p className="text-sm text-gray-600">
                            {entry.calories} calories
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
