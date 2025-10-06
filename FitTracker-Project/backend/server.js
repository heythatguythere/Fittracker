// In backend/server.js
// I'm providing the full file to be safe. The only new part is the DELETE /api/workouts/:id route.

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const { marked } = require('marked');
const Groq = require('groq-sdk');
require('dotenv').config();

// ... [all model imports are the same]
const User = require('./models/User');
const Workout = require('./models/Workout');
const Measurement = require('./models/Measurement');
const DietEntry = require('./models/DietEntry');
const Profile = require('./models/Profile');
const Goal = require('./models/Goal');
const WorkoutTemplate = require('./models/WorkoutTemplate');


const app = express();

// ... [all middleware setup is the same]
require('./config/passport-setup'); 
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1); 
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { sameSite: 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }}));
app.use(passport.initialize());
app.use(passport.session());
const isAuth = (req, res, next) => { if (req.user) next(); else res.status(401).send({ msg: 'Not Authenticated' }); };
const isAdmin = (req, res, next) => { if (req.user && req.user.role === 'admin') next(); else res.status(403).send({ msg: 'Forbidden' }); };


// ... [all auth routes are the same]
app.post('/auth/register', async (req, res) => { 
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ msg: 'User created successfully', newUser: true });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});
app.post('/auth/login', (req, res, next) => { passport.authenticate('local', (err, user, info) => { if (err) { return next(err); } if (!user) { return res.status(401).json({ msg: info.message || 'Invalid credentials.' }); } req.logIn(user, (err) => { if (err) { return next(err); } return res.json({ msg: 'Logged in successfully!', user: req.user }); }); })(req, res, next); });
app.post('/auth/admin/login', (req, res, next) => { passport.authenticate('local', (err, user, info) => { if (err) { return next(err); } if (!user) { return res.status(401).json({ msg: info.message || 'Invalid credentials.' }); } if (user.role !== 'admin') { return res.status(403).json({ msg: 'Forbidden.' }); } req.logIn(user, (err) => { if (err) { return next(err); } return res.json({ msg: 'Admin logged in successfully!', user: req.user }); }); })(req, res, next); });
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }), (req, res) => res.redirect('http://localhost:5173/dashboard'));
app.get('/auth/logout', (req, res, next) => { req.logout(function(err) { if (err) { return next(err); } req.session.destroy(() => res.status(200).send({ msg: "Logged out" })); }); });
app.delete('/api/user', isAuth, async (req, res) => { 
    try {
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({ msg: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});


// --- API Routes ---
app.get('/api/current_user', isAuth, (req, res) => { res.send(req.user); });

// -- Workout Routes --
app.get('/api/workouts', isAuth, async (req, res) => { try { const data = await Workout.find({ userId: req.user._id }).sort({ workout_date: -1 }); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.post('/api/workouts', isAuth, async (req, res) => { try { const data = new Workout({ ...req.body, userId: req.user._id }); await data.save(); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.put('/api/workouts/:id', isAuth, async (req, res) => { try { const d = await Workout.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true }); res.json(d); } catch (e) { res.status(400).json({ msg: 'Error' }); } });

// --- NEW/RESTORED DELETE WORKOUT ROUTE ---
app.delete('/api/workouts/:id', isAuth, async (req, res) => { 
    try { 
        const { id } = req.params;
        await Workout.findOneAndDelete({ _id: id, userId: req.user._id }); 
        res.status(200).json({ msg: 'Workout deleted successfully' }); 
    } catch (err) { 
        res.status(500).json({ msg: 'Server error while deleting workout.' }); 
    } 
});


// ... [All other routes for measurements, diet, profile, etc. are the same]
// (Code omitted for brevity)
app.get('/api/measurements', isAuth, async (req, res) => { try { const data = await Measurement.find({ userId: req.user._id }).sort({ measurement_date: -1 }); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.post('/api/measurements', isAuth, async (req, res) => { try { const data = new Measurement({ ...req.body, userId: req.user._id }); await data.save(); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.put('/api/measurements/:id', isAuth, async (req, res) => { try { const d = await Measurement.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true }); res.json(d); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.delete('/api/measurements/:id', isAuth, async (req, res) => { try { await Measurement.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); res.status(200).json({ msg: 'Deleted' }); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.get('/api/profile', isAuth, async (req, res) => { try { let p = await Profile.findOne({ userId: req.user._id }); if (!p) { p = new Profile({ userId: req.user._id }); await p.save(); } res.json(p); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/profile', isAuth, async (req, res) => { try { const p = await Profile.findOneAndUpdate({ userId: req.user._id }, { $set: req.body }, { new: true, upsert: true }); res.json(p); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.get('/api/goals', isAuth, async (req, res) => { try { const g = await Goal.find({ userId: req.user._id }); res.json(g); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/goals', isAuth, async (req, res) => { try { const g = new Goal({ ...req.body, userId: req.user._id }); await g.save(); res.status(201).json(g); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.get('/api/templates', isAuth, async (req, res) => { try { const t = await WorkoutTemplate.find({ userId: req.user._id }); res.json(t); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/templates', isAuth, async (req, res) => { try { const t = new WorkoutTemplate({ ...req.body, userId: req.user._id }); await t.save(); res.status(201).json(t); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.get('/api/diet', isAuth, async (req, res) => { try { const entries = await DietEntry.find({ userId: req.user._id }).sort({ entry_date: -1 }); res.json(entries); } catch (err) { res.status(400).json({ msg: 'Error' }); } });
app.post('/api/diet', isAuth, async (req, res) => { try { const newDietEntry = new DietEntry({ ...req.body, userId: req.user._id }); const savedEntry = await newDietEntry.save(); res.json(savedEntry); } catch (err) { res.status(400).json({ msg: 'Error' }); } });
app.delete('/api/diet/:id', isAuth, async (req, res) => { try { await DietEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); res.status(200).json({ msg: 'Deleted' }); } catch (err) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/diet/suggestions', isAuth, async (req, res) => { 
    try {
        const { profile, dietEntries } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const todaysEntries = dietEntries.filter(entry => new Date(entry.entry_date).toISOString().split('T')[0] === today);
        const totalCaloriesToday = todaysEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
        const remainingCalories = Math.max(0, (profile?.calorie_goal || 2000) - totalCaloriesToday);
        
        // Simple meal suggestions based on remaining calories
        const suggestions = [];
        
        if (remainingCalories > 0) {
            if (remainingCalories >= 600) {
                suggestions.push({
                    meal_name: "Grilled Chicken Breast with Rice",
                    description: "High protein meal with complex carbs",
                    calories: 450,
                    protein_g: 35,
                    carbs_g: 45,
                    fat_g: 8
                });
            }
            
            if (remainingCalories >= 400) {
                suggestions.push({
                    meal_name: "Salmon with Quinoa",
                    description: "Omega-3 rich meal with complete protein",
                    calories: 380,
                    protein_g: 28,
                    carbs_g: 35,
                    fat_g: 12
                });
            }
            
            if (remainingCalories >= 300) {
                suggestions.push({
                    meal_name: "Greek Yogurt with Berries",
                    description: "High protein snack with antioxidants",
                    calories: 250,
                    protein_g: 20,
                    carbs_g: 25,
                    fat_g: 5
                });
            }
            
            if (remainingCalories >= 200) {
                suggestions.push({
                    meal_name: "Protein Smoothie",
                    description: "Quick and nutritious post-workout option",
                    calories: 180,
                    protein_g: 25,
                    carbs_g: 15,
                    fat_g: 3
                });
            }
        }
        
        res.json({ suggestions: suggestions.slice(0, 3) });
    } catch (error) {
        console.error("Error generating suggestions:", error);
        res.status(500).json({ msg: 'Error generating meal suggestions' });
    }
});
app.get('/api/dashboard-summary', isAuth, async (req, res) => { 
    try { 
        const workouts = await Workout.find({ userId: req.user._id });
        const measurements = await Measurement.find({ userId: req.user._id }).sort({ measurement_date: -1 });
        
        // Calculate workout streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            
            const hasWorkout = workouts.some(workout => {
                const workoutDate = new Date(workout.workout_date);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === checkDate.getTime();
            });
            
            if (hasWorkout) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        const summary = {
            totalWorkouts: workouts.length,
            streak: streak,
            latestWeight: measurements.length > 0 ? measurements[0].weight_kg : null
        };
        
        res.json(summary);
    } catch (e) { 
        res.status(500).json({ msg: 'Error fetching dashboard summary' }); 
    } 
});
app.post('/api/generate-report', isAuth, async (req, res) => { 
    try {
        const { profile, workouts, measurements, dietEntries } = req.body;
        
        // Enhanced analytics
        const totalWorkouts = workouts.length;
        const totalMeasurements = measurements.length;
        const totalDietEntries = dietEntries.length;
        
        // Weight analysis
        const latestWeight = measurements.length > 0 ? measurements[0].weight_kg : null;
        const initialWeight = measurements.length > 0 ? measurements[measurements.length - 1].weight_kg : null;
        const weightChange = latestWeight && initialWeight ? (latestWeight - initialWeight).toFixed(1) : null;
        
        // Workout analysis
        const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
        const avgWorkoutDuration = workouts.length > 0 
            ? workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) / workouts.length 
            : 0;
        
        // Weekly analysis
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const weeklyWorkouts = workouts.filter(w => new Date(w.workout_date) >= last7Days).length;
        const weeklyCalories = dietEntries
            .filter(d => new Date(d.entry_date) >= last7Days)
            .reduce((sum, d) => sum + (d.calories || 0), 0);
        
        // Exercise frequency analysis
        const exerciseCounts = {};
        workouts.forEach(workout => {
            workout.exercises?.forEach(exercise => {
                const name = exercise.exercise_name || exercise.name || 'Unknown';
                exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
            });
        });
        const topExercises = Object.entries(exerciseCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        // BMI calculation
        const currentBMI = latestWeight && profile?.height_cm 
            ? (latestWeight / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
            : null;
        
        let report = `# 📊 Comprehensive Fitness Analytics Report\n\n`;
        
        // Executive Summary
        report += `## 🎯 Executive Summary\n`;
        report += `- **Total Workouts Completed**: ${totalWorkouts}\n`;
        report += `- **Total Calories Burned**: ${totalCaloriesBurned.toLocaleString()} kcal\n`;
        report += `- **Average Workout Duration**: ${Math.round(avgWorkoutDuration)} minutes\n`;
        report += `- **Weekly Workout Frequency**: ${weeklyWorkouts} sessions\n`;
        report += `- **Current BMI**: ${currentBMI || 'Not available'}\n\n`;
        
        // Weight Progress Analysis
        if (weightChange !== null) {
            const changeDirection = parseFloat(weightChange) > 0 ? 'gained' : 'lost';
            const changePercent = initialWeight ? ((Math.abs(parseFloat(weightChange)) / initialWeight) * 100).toFixed(1) : 0;
            report += `## ⚖️ Weight Progress Analysis\n`;
            report += `- **Weight Change**: ${Math.abs(parseFloat(weightChange))} kg ${changeDirection} (${changePercent}%)\n`;
            report += `- **Current Weight**: ${latestWeight} kg\n`;
            report += `- **Starting Weight**: ${initialWeight} kg\n`;
            report += `- **Progress Rate**: ${changePercent}% change from starting weight\n\n`;
        }
        
        // Workout Performance Analysis
        report += `## 💪 Workout Performance Analysis\n`;
        report += `- **Total Training Volume**: ${totalCaloriesBurned.toLocaleString()} calories burned\n`;
        report += `- **Average Session Length**: ${Math.round(avgWorkoutDuration)} minutes\n`;
        report += `- **Weekly Consistency**: ${weeklyWorkouts} workouts this week\n`;
        report += `- **Consistency Rating**: ${weeklyWorkouts >= 4 ? 'Excellent' : weeklyWorkouts >= 3 ? 'Good' : weeklyWorkouts >= 2 ? 'Fair' : 'Needs Improvement'}\n\n`;
        
        // Exercise Distribution
        if (topExercises.length > 0) {
            report += `## 🏋️ Most Performed Exercises\n`;
            topExercises.forEach(([exercise, count], index) => {
                report += `${index + 1}. **${exercise}**: ${count} times\n`;
            });
            report += `\n`;
        }
        
        // Nutrition Analysis
        if (totalDietEntries > 0) {
            const avgDailyCalories = weeklyCalories / 7;
            report += `## 🍎 Nutrition Analysis\n`;
            report += `- **Weekly Calorie Intake**: ${weeklyCalories.toLocaleString()} kcal\n`;
            report += `- **Average Daily Intake**: ${Math.round(avgDailyCalories)} kcal/day\n`;
            report += `- **Calorie Balance**: ${totalCaloriesBurned - weeklyCalories > 0 ? 'Deficit' : 'Surplus'} of ${Math.abs(totalCaloriesBurned - weeklyCalories).toLocaleString()} kcal\n\n`;
        }
        
        // Trend Analysis
        report += `## 📈 Trend Analysis\n`;
        if (weeklyWorkouts >= 4) {
            report += `✅ **Excellent Progress**: You're maintaining a high workout frequency\n`;
        } else if (weeklyWorkouts >= 2) {
            report += `⚠️ **Good Progress**: Consider increasing workout frequency for better results\n`;
        } else {
            report += `❌ **Needs Attention**: Workout frequency is below recommended levels\n`;
        }
        
        if (avgWorkoutDuration >= 45) {
            report += `✅ **Great Duration**: Your workout sessions are well-structured\n`;
        } else if (avgWorkoutDuration >= 30) {
            report += `⚠️ **Good Duration**: Consider extending sessions for better results\n`;
        } else {
            report += `❌ **Short Sessions**: Try to increase workout duration\n`;
        }
        
        if (totalCaloriesBurned > 2000) {
            report += `✅ **High Calorie Burn**: Excellent calorie expenditure\n`;
        } else if (totalCaloriesBurned > 1000) {
            report += `⚠️ **Moderate Burn**: Good calorie burn, room for improvement\n`;
        } else {
            report += `❌ **Low Burn**: Consider increasing workout intensity\n`;
        }
        report += `\n`;
        
        // Personalized Recommendations
        report += `## 🎯 Personalized Recommendations\n`;
        
        if (weeklyWorkouts < 3) {
            report += `- **Increase Workout Frequency**: Aim for at least 3-4 workouts per week\n`;
        }
        if (avgWorkoutDuration < 30) {
            report += `- **Extend Workout Sessions**: Try to reach 30-45 minutes per session\n`;
        }
        if (totalMeasurements < 2) {
            report += `- **Track Measurements Regularly**: Log weight and body measurements weekly\n`;
        }
        if (totalDietEntries < 10) {
            report += `- **Improve Nutrition Tracking**: Log meals consistently for better insights\n`;
        }
        if (topExercises.length < 3) {
            report += `- **Diversify Exercise Routine**: Try different exercises for balanced development\n`;
        }
        
        // Goal Achievement Prediction
        if (weightChange !== null && Math.abs(parseFloat(weightChange)) > 0) {
            const weeklyWeightChange = Math.abs(parseFloat(weightChange)) / Math.max(1, Math.ceil((new Date() - new Date(measurements[measurements.length - 1].measurement_date)) / (1000 * 60 * 60 * 24 * 7)));
            report += `\n## 🔮 Progress Projection\n`;
            report += `- **Current Rate**: ${weeklyWeightChange.toFixed(2)} kg per week\n`;
            if (weeklyWeightChange > 0.5) {
                report += `- **Projection**: At this rate, you'll see significant changes in 4-6 weeks\n`;
            } else if (weeklyWeightChange > 0.2) {
                report += `- **Projection**: Steady progress - continue current approach\n`;
            } else {
                report += `- **Projection**: Consider adjusting your approach for faster results\n`;
            }
        }
        
        res.json({ report });
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ msg: 'Error generating report' });
    }
});
app.get('/api/admin/stats', isAuth, isAdmin, async (req, res) => { 
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkouts = await Workout.countDocuments();
        const totalMeasurements = await Measurement.countDocuments();
        const totalDietEntries = await DietEntry.countDocuments();
        
        res.json({
            totalUsers,
            totalWorkouts,
            totalMeasurements,
            totalDietEntries
        });
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});
app.get('/api/admin/users', isAuth, isAdmin, async (req, res) => { 
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Friends Management endpoints
app.get('/api/friends', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'displayName email image')
            .populate('friendRequests', 'displayName email image')
            .populate('sentFriendRequests', 'displayName email image');
        res.json({
            friends: user.friends || [],
            incomingRequests: user.friendRequests || [],
            outgoingRequests: user.sentFriendRequests || []
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Failed to fetch friends' });
    }
});

// Send a friend request (by email)
app.post('/api/friends/request', isAuth, async (req, res) => {
    try {
        const { email } = req.body;
        const recipient = await User.findOne({ email });
        if (!recipient) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (recipient._id.toString() === req.user.id) {
            return res.status(400).json({ error: 'Cannot add yourself as a friend' });
        }
        const requester = await User.findById(req.user.id);

        const alreadyFriends = requester.friends.some(id => id.toString() === recipient._id.toString());
        if (alreadyFriends) {
            return res.status(400).json({ error: 'User is already your friend' });
        }
        const alreadyRequested = requester.sentFriendRequests?.some(id => id.toString() === recipient._id.toString());
        const alreadyIncoming = requester.friendRequests?.some(id => id.toString() === recipient._id.toString());
        if (alreadyRequested) {
            return res.status(400).json({ error: 'Request already sent' });
        }
        // If there is an incoming request from the recipient, accept both sides automatically
        if (alreadyIncoming) {
            requester.friendRequests = requester.friendRequests.filter(id => id.toString() !== recipient._id.toString());
            recipient.sentFriendRequests = (recipient.sentFriendRequests || []).filter(id => id.toString() !== requester._id.toString());
            requester.friends.push(recipient._id);
            recipient.friends.push(requester._id);
            await requester.save();
            await recipient.save();
            return res.json({ message: 'Friend request accepted automatically', friend: { _id: recipient._id, displayName: recipient.displayName, email: recipient.email, image: recipient.image } });
        }

        requester.sentFriendRequests = requester.sentFriendRequests || [];
        recipient.friendRequests = recipient.friendRequests || [];
        requester.sentFriendRequests.push(recipient._id);
        recipient.friendRequests.push(requester._id);
        await requester.save();
        await recipient.save();
        res.json({ message: 'Friend request sent' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Failed to send friend request' });
    }
});

// Accept a friend request
app.post('/api/friends/requests/:requesterId/accept', isAuth, async (req, res) => {
    try {
        const { requesterId } = req.params;
        const me = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);
        if (!requester) return res.status(404).json({ error: 'Requester not found' });
        // Ensure there is an incoming request
        const hasIncoming = me.friendRequests?.some(id => id.toString() === requesterId);
        if (!hasIncoming) return res.status(400).json({ error: 'No incoming request from this user' });

        // Remove from requests, add to friends
        me.friendRequests = me.friendRequests.filter(id => id.toString() !== requesterId);
        requester.sentFriendRequests = (requester.sentFriendRequests || []).filter(id => id.toString() !== me._id.toString());
        if (!me.friends.some(id => id.toString() === requesterId)) me.friends.push(requester._id);
        if (!requester.friends.some(id => id.toString() === me._id.toString())) requester.friends.push(me._id);
        await me.save();
        await requester.save();
        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: 'Failed to accept friend request' });
    }
});

// Decline a friend request
app.post('/api/friends/requests/:requesterId/decline', isAuth, async (req, res) => {
    try {
        const { requesterId } = req.params;
        const me = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);
        if (!requester) return res.status(404).json({ error: 'Requester not found' });
        me.friendRequests = (me.friendRequests || []).filter(id => id.toString() !== requesterId);
        requester.sentFriendRequests = (requester.sentFriendRequests || []).filter(id => id.toString() !== me._id.toString());
        await me.save();
        await requester.save();
        res.json({ message: 'Friend request declined' });
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).json({ error: 'Failed to decline friend request' });
    }
});

// Cancel an outgoing friend request
app.post('/api/friends/cancel/:recipientId', isAuth, async (req, res) => {
    try {
        const { recipientId } = req.params;
        const me = await User.findById(req.user.id);
        const recipient = await User.findById(recipientId);
        if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
        me.sentFriendRequests = (me.sentFriendRequests || []).filter(id => id.toString() !== recipientId);
        recipient.friendRequests = (recipient.friendRequests || []).filter(id => id.toString() !== me._id.toString());
        await me.save();
        await recipient.save();
        res.json({ message: 'Friend request canceled' });
    } catch (error) {
        console.error('Error canceling friend request:', error);
        res.status(500).json({ error: 'Failed to cancel friend request' });
    }
});

app.delete('/api/friends/remove/:friendId', isAuth, async (req, res) => {
    try {
        const { friendId } = req.params;
        const user = await User.findById(req.user.id);
        
        user.friends = user.friends.filter(friend => friend.toString() !== friendId);
        await user.save();
        
        res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ error: 'Failed to remove friend' });
    }
});

app.get('/api/friends/leaderboard', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('friends');
        const friendIds = user.friends.map(friend => friend._id);
        const allUserIds = [req.user.id, ...friendIds];
        
        // Get all users' data
        const users = await User.find({ _id: { $in: allUserIds } }, 'displayName email image');
        
        // Get workouts for all users
        const workouts = await Workout.find({ user_id: { $in: allUserIds } });
        
        // Get measurements for all users
        const measurements = await Measurement.find({ user_id: { $in: allUserIds } });
        
        // Calculate stats for each user
        const leaderboard = users.map(user => {
            const userWorkouts = workouts.filter(w => w.user_id.toString() === user._id.toString());
            const userMeasurements = measurements.filter(m => m.user_id.toString() === user._id.toString());
            
            const totalWorkouts = userWorkouts.length;
            const totalCaloriesBurned = userWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
            const weeklyWorkouts = userWorkouts.filter(w => {
                const workoutDate = new Date(w.workout_date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return workoutDate >= weekAgo;
            }).length;
            
            const latestWeight = userMeasurements.length > 0 ? userMeasurements[0].weight_kg : null;
            const initialWeight = userMeasurements.length > 0 ? userMeasurements[userMeasurements.length - 1].weight_kg : null;
            const weightChange = latestWeight && initialWeight ? (latestWeight - initialWeight).toFixed(1) : null;
            
            return {
                _id: user._id,
                displayName: user.displayName,
                email: user.email,
                image: user.image,
                totalWorkouts,
                totalCaloriesBurned,
                weeklyWorkouts,
                latestWeight,
                weightChange: weightChange ? parseFloat(weightChange) : 0,
                isCurrentUser: user._id.toString() === req.user.id
            };
        });
        
        // Sort by total workouts (descending)
        leaderboard.sort((a, b) => b.totalWorkouts - a.totalWorkouts);
        
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

app.get('/api/friends/:friendId/progress', isAuth, async (req, res) => {
    try {
        const { friendId } = req.params;
        const user = await User.findById(req.user.id);
        
        // Check if friendId is in user's friends list
        if (!user.friends?.some(id => id.toString() === friendId)) {
            return res.status(403).json({ error: 'Not authorized to view this user\'s progress' });
        }
        
        const friend = await User.findById(friendId, 'displayName email image');
        const friendWorkouts = await Workout.find({ user_id: friendId }).sort({ workout_date: -1 }).limit(10);
        const friendMeasurements = await Measurement.find({ user_id: friendId }).sort({ measurement_date: -1 }).limit(10);
        const friendDietEntries = await DietEntry.find({ user_id: friendId }).sort({ entry_date: -1 }).limit(10);
        
        res.json({
            friend,
            workouts: friendWorkouts,
            measurements: friendMeasurements,
            dietEntries: friendDietEntries
        });
    } catch (error) {
        console.error('Error fetching friend progress:', error);
        res.status(500).json({ error: 'Failed to fetch friend progress' });
    }
});

// Groq AI Chatbot endpoint
app.post('/api/chatbot', isAuth, async (req, res) => {
    try {
        const { message, userProfile, recentWorkouts } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Initialize Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY || 'gsk_your_api_key_here'
        });

        // Create context from user data
        let context = `You are an AI fitness coach. User profile: `;
        if (userProfile) {
            context += `Age: ${userProfile.age || 'Not specified'}, Weight: ${userProfile.weight_kg || 'Not specified'}kg, Height: ${userProfile.height_cm || 'Not specified'}cm, Goal: ${userProfile.goal || 'Not specified'}. `;
        }
        
        if (recentWorkouts && recentWorkouts.length > 0) {
            context += `Recent workouts: ${recentWorkouts.length} workouts completed. `;
        }

        context += `Provide helpful, encouraging fitness advice. Keep responses concise and actionable.`;

        // Generate AI response
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: context
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

        res.json({ 
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Groq API error:', error);
        res.status(500).json({ 
            error: 'Failed to generate AI response',
            response: "I'm having trouble connecting to my AI brain right now. Please try again in a moment!"
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));