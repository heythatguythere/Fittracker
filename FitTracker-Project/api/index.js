// Vercel serverless function entry point
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
const User = require('../backend/models/User');
const Workout = require('../backend/models/Workout');
const Measurement = require('../backend/models/Measurement');
const DietEntry = require('../backend/models/DietEntry');
const Profile = require('../backend/models/Profile');
const Goal = require('../backend/models/Goal');
const WorkoutTemplate = require('../backend/models/WorkoutTemplate');

const app = express();

// Middleware Setup
require('../backend/config/passport-setup');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

// CORS configuration for Vercel
app.use(cors({ 
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://fittracker-gules.vercel.app', process.env.VERCEL_URL] 
        : 'http://localhost:5173', 
    credentials: true 
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Session configuration for Vercel
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'fallback-secret-key', 
    resave: true, 
    saveUninitialized: true, 
    cookie: { 
        sameSite: 'none', 
        secure: true, 
        httpOnly: false, 
        maxAge: 24 * 60 * 60 * 1000 
    } 
}));

app.use(passport.initialize());
app.use(passport.session());

// Authentication Middleware
const isAuth = (req, res, next) => { 
    if (req.user) {
        next(); 
    } else {
        res.status(401).json({ msg: 'Not Authenticated', authenticated: false }); 
    }
};

const isAdmin = (req, res, next) => { 
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ msg: 'Forbidden' }); 
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        vercelUrl: process.env.VERCEL_URL || 'https://fittracker-gules.vercel.app'
    });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => { 
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

app.post('/api/auth/login', (req, res, next) => { 
    passport.authenticate('local', (err, user, info) => { 
        if (err) { return next(err); } 
        if (!user) { return res.status(401).json({ msg: info.message || 'Invalid credentials.' }); } 
        req.logIn(user, (err) => { 
            if (err) { return next(err); } 
            return res.json({ msg: 'Logged in successfully!', user: req.user }); 
        }); 
    })(req, res, next); 
});

app.get('/api/auth/logout', (req, res, next) => { 
    req.logout(function(err) { 
        if (err) { return next(err); } 
        req.session.destroy(() => res.status(200).send({ msg: "Logged out" })); 
    }); 
});

// User management routes
app.get('/api/current_user', isAuth, (req, res) => { 
    res.send(req.user); 
});

// Workout routes
app.get('/api/workouts', isAuth, async (req, res) => { 
    try { 
        const data = await Workout.find({ userId: req.user._id }).sort({ workout_date: -1 }); 
        res.json(data); 
    } catch (e) { 
        res.status(400).json({ msg: 'Error' }); 
    } 
});

app.post('/api/workouts', isAuth, async (req, res) => { 
    try { 
        const data = new Workout({ ...req.body, userId: req.user._id }); 
        await data.save(); 
        res.json(data); 
    } catch (e) { 
        res.status(400).json({ msg: 'Error' }); 
    } 
});

// Export for Vercel
module.exports = app;