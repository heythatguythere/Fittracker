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

// Export for Vercel
module.exports = app;