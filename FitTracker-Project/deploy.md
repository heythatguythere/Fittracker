# Quick Deployment Guide

## 1. Backend (Railway)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Set Root Directory to `backend`
6. Add environment variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `SESSION_SECRET`: Any random string
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Will be your Vercel URL

## 2. Frontend (Vercel)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import this repository
5. Set Root Directory to `frontend`
6. Add environment variable:
   - `VITE_API_URL`: Your Railway backend URL

## 3. Database (MongoDB Atlas)

1. Go to https://cloud.mongodb.com
2. Create free account
3. Create new cluster
4. Get connection string
5. Use it as `MONGO_URI` in Railway

## Your URLs will be:
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-app-name.railway.app`
- Database: MongoDB Atlas (free tier)

## Test your deployment:
- Frontend: Visit your Vercel URL
- Backend: Visit `https://your-backend-url.railway.app/api/health`