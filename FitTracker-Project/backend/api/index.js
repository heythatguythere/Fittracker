// Vercel serverless function entry point
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

// CORS configuration
app.use(cors({ 
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://your-frontend-domain.vercel.app'] 
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

// Import all your routes from server.js
// Copy all the route definitions from your server.js file here
// (I'll include the key ones, but you should copy all routes)

// Authentication Middleware
const isAuth = (req, res, next) => { if (req.user) next(); else res.status(401).send({ msg: 'Not Authenticated' }); };
const isAdmin = (req, res, next) => { if (req.user && req.user.role === 'admin') next(); else res.status(403).send({ msg: 'Forbidden' }); };

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// Add all your other routes here...
// (Copy all the routes from your server.js file)

// Export the app for Vercel
module.exports = app;