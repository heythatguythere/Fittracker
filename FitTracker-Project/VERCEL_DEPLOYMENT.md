# Vercel Full-Stack Deployment Guide

## 🚀 Deploy Your FitTracker App to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free)

### Step 1: Set up MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/fittracker`)

### Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. **Important**: Set Root Directory to the project root (not frontend or backend)

### Step 3: Configure Environment Variables
In Vercel dashboard, go to Settings → Environment Variables and add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fittracker
SESSION_SECRET=your-super-secret-session-key-here
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GROQ_API_KEY=your-groq-api-key (optional)
```

### Step 4: Deploy!
Click "Deploy" and wait for it to complete.

### Step 5: Test Your App
- Frontend: `https://your-app-name.vercel.app`
- Backend API: `https://your-app-name.vercel.app/api/health`

## 🎉 You're Done!

Your full-stack app is now live on Vercel with:
- ✅ Frontend (React + Vite)
- ✅ Backend API (Node.js + Express)
- ✅ Database (MongoDB Atlas)
- ✅ All features working

## 📝 Notes
- Vercel automatically handles routing between frontend and API
- All `/api/*` routes go to your backend
- All other routes serve your React app
- Environment variables are automatically available to both frontend and backend

## 🔧 Troubleshooting
- Check Vercel function logs if API isn't working
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify all environment variables are set correctly