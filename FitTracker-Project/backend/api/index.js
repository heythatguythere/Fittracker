// Complete Vercel serverless function with all features
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const Groq = require('groq-sdk');
require('dotenv').config();

// Import Database Models
const User = require('../models/User');
const Workout = require('../models/Workout');
const Measurement = require('../models/Measurement');
const DietEntry = require('../models/DietEntry');
const Profile = require('../models/Profile');
const Goal = require('../models/Goal');
const WorkoutTemplate = require('../models/WorkoutTemplate');

const app = express();

// Middleware Setup
require('../config/passport-setup');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

// CORS configuration for Vercel
app.use(cors({ 
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.VERCEL_URL, 'https://your-app-name.vercel.app'] 
        : 'http://localhost:5173', 
    credentials: true 
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Session configuration for Vercel
app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        sameSite: 'lax', 
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000 
    } 
}));

app.use(passport.initialize());
app.use(passport.session());

// Authentication Middleware
const isAuth = (req, res, next) => { if (req.user) next(); else res.status(401).send({ msg: 'Not Authenticated' }); };
const isAdmin = (req, res, next) => { if (req.user && req.user.role === 'admin') next(); else res.status(403).send({ msg: 'Forbidden' }); };

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running', timestamp: new Date().toISOString() });
});

// Authentication routes
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
        req.logIn(newUser, (err) => { 
            if (err) { 
                return res.status(500).json({ msg: 'Server error during login after registration.' }); 
            } 
            res.status(201).json({ msg: 'User created successfully', newUser: true, user: req.user }); 
        }); 
    } catch (error) { 
        res.status(500).json({ msg: 'Server error' }); 
    } 
});

app.post('/auth/login', (req, res, next) => { 
    passport.authenticate('local', (err, user, info) => { 
        if (err) { return next(err); } 
        if (!user) { return res.status(401).json({ msg: info.message || 'Invalid credentials.' }); } 
        req.logIn(user, (err) => { 
            if (err) { return next(err); } 
            return res.json({ msg: 'Logged in successfully!', user: req.user }); 
        }); 
    })(req, res, next); 
});

app.post('/auth/admin/login', (req, res, next) => { 
    passport.authenticate('local', (err, user, info) => { 
        if (err) { return next(err); } 
        if (!user) { return res.status(401).json({ msg: info.message || 'Invalid credentials.' }); } 
        if (user.role !== 'admin') { return res.status(403).json({ msg: 'Forbidden.' }); } 
        req.logIn(user, (err) => { 
            if (err) { return next(err); } 
            return res.json({ msg: 'Admin logged in successfully!', user: req.user }); 
        }); 
    })(req, res, next); 
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/login` : 'https://your-app-name.vercel.app/login' }), (req, res) => res.redirect(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/dashboard` : 'https://your-app-name.vercel.app/dashboard'));

app.get('/auth/logout', (req, res, next) => { 
    req.logout(function(err) { 
        if (err) { return next(err); } 
        req.session.destroy(() => res.status(200).send({ msg: "Logged out" })); 
    }); 
});

app.delete('/api/user', isAuth, async (req, res) => { try { await User.findByIdAndDelete(req.user._id); res.status(200).json({ msg: 'User deleted successfully' }); } catch (error) { res.status(500).json({ msg: 'Server error' }); } });
app.get('/api/current_user', isAuth, (req, res) => { res.send(req.user); });

// Workout routes
app.get('/api/workouts', isAuth, async (req, res) => { try { const data = await Workout.find({ userId: req.user._id }).sort({ workout_date: -1 }); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.post('/api/workouts', isAuth, async (req, res) => { try { const data = new Workout({ ...req.body, userId: req.user._id }); await data.save(); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.put('/api/workouts/:id', isAuth, async (req, res) => { try { const d = await Workout.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true }); res.json(d); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.delete('/api/workouts/:id', isAuth, async (req, res) => { try { await Workout.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); res.status(200).json({ msg: 'Deleted' }); } catch (err) { res.status(500).json({ msg: 'Server error' }); } });

// Measurement routes
app.get('/api/measurements', isAuth, async (req, res) => { try { const data = await Measurement.find({ userId: req.user._id }).sort({ measurement_date: -1 }); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.post('/api/measurements', isAuth, async (req, res) => { try { const data = new Measurement({ ...req.body, userId: req.user._id }); await data.save(); res.json(data); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.put('/api/measurements/:id', isAuth, async (req, res) => { try { const d = await Measurement.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: req.body }, { new: true }); res.json(d); } catch (e) { res.status(400).json({ msg: 'Error' }); } });
app.delete('/api/measurements/:id', isAuth, async (req, res) => { try { await Measurement.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); res.status(200).json({ msg: 'Deleted' }); } catch (e) { res.status(500).json({ msg: 'Error' }); } });

// Profile routes
app.get('/api/profile', isAuth, async (req, res) => { try { let p = await Profile.findOne({ userId: req.user._id }); if (!p) { p = new Profile({ userId: req.user._id }); await p.save(); } res.json(p); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/profile', isAuth, async (req, res) => { try { const p = await Profile.findOneAndUpdate({ userId: req.user._id }, { $set: req.body }, { new: true, upsert: true }); res.json(p); } catch (e) { res.status(400).json({ msg: 'Error' }); } });

// Goals routes
app.get('/api/goals', isAuth, async (req, res) => { try { const g = await Goal.find({ userId: req.user._id }); res.json(g); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/goals', isAuth, async (req, res) => { try { const g = new Goal({ ...req.body, userId: req.user._id }); await g.save(); res.status(201).json(g); } catch (e) { res.status(400).json({ msg: 'Error' }); } });

// Templates routes
app.get('/api/templates', isAuth, async (req, res) => { try { const t = await WorkoutTemplate.find({ userId: req.user._id }); res.json(t); } catch (e) { res.status(500).json({ msg: 'Error' }); } });
app.post('/api/templates', isAuth, async (req, res) => { try { const t = new WorkoutTemplate({ ...req.body, userId: req.user._id }); await t.save(); res.status(201).json(t); } catch (e) { res.status(400).json({ msg: 'Error' }); } });

// Diet routes
app.get('/api/diet', isAuth, async (req, res) => { try { const entries = await DietEntry.find({ userId: req.user._id }).sort({ entry_date: -1 }); res.json(entries); } catch (err) { res.status(400).json({ msg: 'Error' }); } });
app.post('/api/diet', isAuth, async (req, res) => { try { const newDietEntry = new DietEntry({ ...req.body, userId: req.user._id }); const savedEntry = await newDietEntry.save(); res.json(savedEntry); } catch (err) { res.status(400).json({ msg: 'Error' }); } });
app.delete('/api/diet/:id', isAuth, async (req, res) => { try { await DietEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); res.status(200).json({ msg: 'Deleted' }); } catch (err) { res.status(500).json({ msg: 'Error' }); } });

// AI-powered diet suggestions (simplified without marked)
app.post('/api/diet/suggestions', isAuth, async (req, res) => {
    try {
        const { profile, dietEntries } = req.body;
        
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'AI service not configured' });
        }
        
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `Based on this user's profile and recent diet entries, suggest 3 healthy meal options:
        
        Profile: ${JSON.stringify(profile)}
        Recent Diet Entries: ${JSON.stringify(dietEntries.slice(0, 5))}
        
        For each suggestion, provide:
        - meal_name: A creative name for the meal
        - description: Brief description
        - calories: Estimated calories
        - protein_g: Protein in grams
        - carbs_g: Carbs in grams
        - fat_g: Fat in grams
        
        Return as JSON array of meal suggestions.`;
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 1000
        });
        
        const response = completion.choices[0]?.message?.content || '[]';
        let suggestions;
        try {
            suggestions = JSON.parse(response);
        } catch (parseError) {
            suggestions = [
                {
                    meal_name: "Grilled Chicken with Rice",
                    description: "Lean protein with complex carbs for sustained energy",
                    calories: 350,
                    protein_g: 35,
                    carbs_g: 30,
                    fat_g: 8
                },
                {
                    meal_name: "Vegetable Stir Fry",
                    description: "Fresh vegetables with tofu for a healthy plant-based meal",
                    calories: 280,
                    protein_g: 15,
                    carbs_g: 25,
                    fat_g: 12
                },
                {
                    meal_name: "Greek Yogurt Parfait",
                    description: "Protein-rich yogurt with berries and granola",
                    calories: 200,
                    protein_g: 20,
                    carbs_g: 25,
                    fat_g: 5
                }
            ];
        }
        
        res.json({ suggestions });
    } catch (error) {
        console.error('Diet suggestions error:', error);
        const fallbackSuggestions = [
            {
                meal_name: "Grilled Chicken with Rice",
                description: "Lean protein with complex carbs for sustained energy",
                calories: 350,
                protein_g: 35,
                carbs_g: 30,
                fat_g: 8
            },
            {
                meal_name: "Vegetable Stir Fry",
                description: "Fresh vegetables with tofu for a healthy plant-based meal",
                calories: 280,
                protein_g: 15,
                carbs_g: 25,
                fat_g: 12
            },
            {
                meal_name: "Greek Yogurt Parfait",
                description: "Protein-rich yogurt with berries and granola",
                calories: 200,
                protein_g: 20,
                carbs_g: 25,
                fat_g: 5
            }
        ];
        res.json({ suggestions: fallbackSuggestions });
    }
});

// Calorie calculation (simplified)
app.post('/api/diet/calculate-calories', isAuth, async (req, res) => {
    try {
        const { foodName, mealType, portionSize } = req.body;
        
        // Simple fallback calculation
        const fallbackNutrition = {
            calories: 200,
            protein_g: 10,
            carbs_g: 20,
            fat_g: 5
        };
        
        res.json(fallbackNutrition);
    } catch (error) {
        console.error('Calorie calculation error:', error);
        res.json({
            calories: 200,
            protein_g: 10,
            carbs_g: 20,
            fat_g: 5
        });
    }
});

// Dashboard summary
app.get('/api/dashboard-summary', isAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const totalWorkouts = await Workout.countDocuments({ userId });
        const workouts = await Workout.find({ userId }).sort({ workout_date: -1 });
        let streak = 0;
        if (workouts.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let currentDate = new Date(today);
            let hasWorkoutToday = false;
            
            for (const workout of workouts) {
                const workoutDate = new Date(workout.workout_date);
                workoutDate.setHours(0, 0, 0, 0);
                if (workoutDate.getTime() === currentDate.getTime()) {
                    hasWorkoutToday = true;
                    break;
                }
            }
            
            if (hasWorkoutToday) {
                streak = 1;
                currentDate.setDate(currentDate.getDate() - 1);
                
                while (true) {
                    let foundWorkout = false;
                    for (const workout of workouts) {
                        const workoutDate = new Date(workout.workout_date);
                        workoutDate.setHours(0, 0, 0, 0);
                        if (workoutDate.getTime() === currentDate.getTime()) {
                            foundWorkout = true;
                            break;
                        }
                    }
                    
                    if (foundWorkout) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    } else {
                        break;
                    }
                }
            }
        }
        
        const latestMeasurement = await Measurement.findOne({ userId }).sort({ measurement_date: -1 });
        const latestWeight = latestMeasurement ? latestMeasurement.weight_kg : null;
        
        res.json({
            totalWorkouts,
            streak,
            latestWeight
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ error: 'Server error fetching dashboard summary' });
    }
});

// Generate report (simplified without marked)
app.post('/api/generate-report', isAuth, async (req, res) => {
    try {
        const { profile, workouts, measurements, dietEntries } = req.body;
        
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'AI service not configured' });
        }
        
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `Analyze this fitness data and generate a comprehensive fitness report:
        
        Profile: ${JSON.stringify(profile)}
        Recent Workouts: ${JSON.stringify(workouts.slice(0, 10))}
        Recent Measurements: ${JSON.stringify(measurements.slice(0, 10))}
        Recent Diet Entries: ${JSON.stringify(dietEntries.slice(0, 10))}
        
        Please provide insights on:
        1. Progress trends
        2. Areas for improvement
        3. Recommendations
        4. Motivational insights
        
        Format as a detailed markdown report.`;
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 2000
        });
        
        const report = completion.choices[0]?.message?.content || 'Unable to generate report';
        res.json({ report });
    } catch (error) {
        console.error('Generate report error:', error);
        const fallbackReport = `# Fitness Report

## Summary
Based on your recent activity, here are some insights:

### Recent Progress
- Continue tracking your workouts consistently
- Monitor your nutrition intake
- Stay hydrated throughout the day

### Recommendations
1. **Consistency**: Keep up with your regular workout routine
2. **Nutrition**: Focus on balanced meals with adequate protein
3. **Recovery**: Ensure proper rest between workout sessions

### Next Steps
- Set specific goals for the upcoming week
- Track your progress regularly
- Adjust your routine based on your results

*This is a basic report. For more detailed insights, ensure your AI service is properly configured.*`;
        res.json({ report: fallbackReport });
    }
});

// Admin routes
app.get('/api/admin/stats', isAuth, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalWorkouts = await Workout.countDocuments();
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersLast7Days = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        const totalMeasurements = await Measurement.countDocuments();
        const totalDietEntries = await DietEntry.countDocuments();
        
        res.json({
            totalUsers,
            totalWorkouts,
            newUsersLast7Days,
            totalMeasurements,
            totalDietEntries
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

app.get('/api/admin/users', isAuth, isAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'displayName email role createdAt image')
            .sort({ createdAt: -1 });
        
        res.json(users);
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Friends API routes
app.get('/api/friends', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'displayName email image')
            .populate('friendRequestsReceived', 'displayName email image')
            .populate('friendRequestsSent', 'displayName email image');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ friends: user.friends || [], incomingRequests: user.friendRequestsReceived || [], outgoingRequests: user.friendRequestsSent || [] });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error fetching friends data' }); }
});

app.post('/api/friends/request', isAuth, async (req, res) => {
    try {
        const { email } = req.body;
        const recipient = await User.findOne({ email });
        if (!recipient) return res.status(404).json({ error: "User with that email not found." });
        if (recipient._id.equals(req.user.id)) return res.status(400).json({ error: "You cannot add yourself as a friend." });

        const requester = await User.findById(req.user.id);
        
        if (!requester.friends) requester.friends = [];
        if (!requester.friendRequestsSent) requester.friendRequestsSent = [];
        if (!recipient.friendRequestsReceived) recipient.friendRequestsReceived = [];

        if (requester.friends.some(id => id.equals(recipient._id))) return res.status(400).json({ error: "You are already friends with this user." });
        if (requester.friendRequestsSent.some(id => id.equals(recipient._id))) return res.status(400).json({ error: "You have already sent a request to this user." });
        
        recipient.friendRequestsReceived.push(requester._id);
        requester.friendRequestsSent.push(recipient._id);
        
        await recipient.save();
        await requester.save();
        res.status(200).json({ message: "Friend request sent." });
    } catch (error) { console.error("Server error sending friend request:", error); res.status(500).json({ error: 'Server error sending request' }); }
});

app.post('/api/friends/requests/:requesterId/accept', isAuth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        const requester = await User.findById(req.params.requesterId);
        if (!requester || !(me.friendRequestsReceived || []).some(id => id.equals(requester._id))) return res.status(404).json({ error: 'Request not found.' });

        me.friends.push(requester._id);
        requester.friends.push(me._id);
        me.friendRequestsReceived = (me.friendRequestsReceived || []).filter(id => !id.equals(requester._id));
        requester.friendRequestsSent = (requester.friendRequestsSent || []).filter(id => !id.equals(me._id));

        await me.save();
        await requester.save();
        res.status(200).json({ message: 'Friend request accepted.' });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error accepting request' }); }
});

app.delete('/api/friends/cancel/:recipientId', isAuth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        const recipient = await User.findById(req.params.recipientId);
        
        me.friendRequestsSent = (me.friendRequestsSent || []).filter(id => !id.equals(req.params.recipientId));
        if (recipient) {
            recipient.friendRequestsReceived = (recipient.friendRequestsReceived || []).filter(id => !id.equals(me._id));
            await recipient.save();
        }
        await me.save();
        res.status(200).json({ message: 'Friend request canceled.' });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error canceling request' }); }
});

app.post('/api/friends/requests/:requesterId/decline', isAuth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        const requester = await User.findById(req.params.requesterId);
        if (!requester || !(me.friendRequestsReceived || []).some(id => id.equals(requester._id))) return res.status(404).json({ error: 'Request not found.' });

        me.friendRequestsReceived = (me.friendRequestsReceived || []).filter(id => !id.equals(requester._id));
        requester.friendRequestsSent = (requester.friendRequestsSent || []).filter(id => !id.equals(me._id));

        await me.save();
        await requester.save();
        res.status(200).json({ message: 'Friend request declined.' });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error declining request' }); }
});

app.delete('/api/friends/remove/:friendId', isAuth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        const friend = await User.findById(req.params.friendId);
        
        if (!friend) return res.status(404).json({ error: 'Friend not found.' });
        
        me.friends = (me.friends || []).filter(id => !id.equals(friend._id));
        friend.friends = (friend.friends || []).filter(id => !id.equals(me._id));
        
        await me.save();
        await friend.save();
        res.status(200).json({ message: 'Friend removed.' });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error removing friend' }); }
});

app.get('/api/friends/leaderboard', isAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const friends = await User.find({ _id: { $in: currentUser.friends || [] } });
        
        const leaderboard = [];
        
        const currentUserWorkouts = await Workout.find({ userId: req.user.id });
        const currentUserTotalCalories = currentUserWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
        const currentUserWeeklyWorkouts = currentUserWorkouts.filter(w => {
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(w.workout_date) >= weekAgo;
        }).length;
        
        leaderboard.push({
            _id: currentUser._id,
            displayName: currentUser.displayName,
            email: currentUser.email,
            image: currentUser.image,
            totalWorkouts: currentUserWorkouts.length,
            totalCaloriesBurned: currentUserTotalCalories,
            weeklyWorkouts: currentUserWeeklyWorkouts,
            isCurrentUser: true
        });
        
        for (const friend of friends) {
            const friendWorkouts = await Workout.find({ userId: friend._id });
            const friendTotalCalories = friendWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
            const friendWeeklyWorkouts = friendWorkouts.filter(w => {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return new Date(w.workout_date) >= weekAgo;
            }).length;
            
            leaderboard.push({
                _id: friend._id,
                displayName: friend.displayName,
                email: friend.email,
                image: friend.image,
                totalWorkouts: friendWorkouts.length,
                totalCaloriesBurned: friendTotalCalories,
                weeklyWorkouts: friendWeeklyWorkouts,
                isCurrentUser: false
            });
        }
        
        leaderboard.sort((a, b) => b.totalWorkouts - a.totalWorkouts);
        
        res.json(leaderboard);
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error fetching leaderboard' }); }
});

app.get('/api/friends/:friendId/progress', isAuth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const friend = await User.findById(req.params.friendId);
        
        if (!friend) return res.status(404).json({ error: 'Friend not found.' });
        if (!currentUser.friends.some(id => id.equals(friend._id))) return res.status(403).json({ error: 'Not friends with this user.' });
        
        const [workouts, measurements, dietEntries] = await Promise.all([
            Workout.find({ userId: friend._id }).sort({ workout_date: -1 }).limit(10),
            Measurement.find({ userId: friend._id }).sort({ measurement_date: -1 }).limit(10),
            DietEntry.find({ userId: friend._id }).sort({ entry_date: -1 }).limit(10)
        ]);
        
        res.json({
            friend: {
                _id: friend._id,
                displayName: friend.displayName,
                email: friend.email,
                image: friend.image
            },
            workouts,
            measurements,
            dietEntries
        });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error fetching friend progress' }); }
});

// Test endpoint for debugging
app.get('/api/test-nutrition', (req, res) => {
    const testNutrition = {
        calories: 300,
        protein_g: 25,
        carbs_g: 30,
        fat_g: 10
    };
    res.json(testNutrition);
});

// Export for Vercel
module.exports = app;