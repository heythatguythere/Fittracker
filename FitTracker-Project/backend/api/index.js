// Simplified Vercel serverless function
const express = require('express');
const cors = require('cors');

const app = express();

// Basic CORS configuration
app.use(cors({
    origin: process.env.VERCEL_URL || 'https://your-app-name.vercel.app',
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API is working!',
        env: {
            NODE_ENV: process.env.NODE_ENV,
            MONGO_URI: process.env.MONGO_URI ? 'Set' : 'Not set',
            SESSION_SECRET: process.env.SESSION_SECRET ? 'Set' : 'Not set'
        }
    });
});

// Basic auth endpoints (without marked dependency)
app.post('/auth/register', async (req, res) => {
    res.json({ message: 'Registration endpoint - add your logic here' });
});

app.post('/auth/login', async (req, res) => {
    res.json({ message: 'Login endpoint - add your logic here' });
});

// Basic API endpoints
app.get('/api/workouts', (req, res) => {
    res.json({ message: 'Workouts endpoint - add your logic here' });
});

app.post('/api/workouts', (req, res) => {
    res.json({ message: 'Create workout endpoint - add your logic here' });
});

// Export for Vercel
module.exports = app;