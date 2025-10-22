# Deploy Backend to Render

## Prerequisites
- GitHub account with your FitTracker repository
- MongoDB Atlas account (for database)
- Groq API key (for AI features)
- Google OAuth credentials (if using Google login)

## Step-by-Step Deployment Guide

### 1. Prepare MongoDB Atlas (if not already done)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/fittracker`)
5. Make sure to whitelist all IPs (0.0.0.0/0) in Network Access

### 2. Deploy to Render

#### Option A: Using Render Dashboard (Recommended for beginners)

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your FitTracker repository

3. **Configure Service**
   - **Name**: `fittracker-backend` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `FitTracker-Project/backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_random_secret_key
   FRONTEND_URL=https://fittracker-gules.vercel.app
   GROQ_API_KEY=your_groq_api_key
   GOOGLE_CLIENT_ID=your_google_client_id (if using)
   GOOGLE_CLIENT_SECRET=your_google_client_secret (if using)
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your backend will be available at: `https://fittracker-backend.onrender.com`

#### Option B: Using render.yaml (Advanced)

1. The `render.yaml` file is already in your backend folder
2. Go to Render Dashboard → "New +" → "Blueprint"
3. Connect your repository
4. Render will auto-detect the `render.yaml`
5. Add environment variables in the Render dashboard

### 3. Update Frontend to Use Render Backend

After deployment, update your frontend to point to the Render backend:

**In `frontend/src/` (wherever you have axios calls):**

You have two options:

**Option 1: Environment Variable (Recommended)**

Create/update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-name.onrender.com
```

Then update axios calls to use:
```javascript
axios.get(`${import.meta.env.VITE_API_URL}/api/workouts`)
```

**Option 2: Direct Update**

Update the axios base URL in your frontend code to:
```javascript
axios.defaults.baseURL = 'https://your-backend-name.onrender.com';
```

### 4. Update CORS in Backend

Your backend is already configured! The CORS settings in `server.js` line 28-33 should work:
```javascript
origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://your-frontend-domain.vercel.app'] 
    : 'http://localhost:5173'
```

Just make sure `FRONTEND_URL` environment variable in Render is set to:
```
https://fittracker-gules.vercel.app
```

### 5. Update Google OAuth Callback (if using)

If you're using Google OAuth, update the callback URLs in:
1. Google Cloud Console → APIs & Credentials → OAuth 2.0 Client IDs
2. Add authorized redirect URI: `https://your-backend-name.onrender.com/auth/google/callback`

Then update `server.js` line 50 callback redirect to your frontend URL.

### 6. Test Your Deployment

1. Go to `https://your-backend-name.onrender.com`
2. You should see your API responding
3. Test from your Vercel frontend
4. Check Render logs for any errors

## Common Issues & Solutions

### Issue: "Application failed to respond"
**Solution**: Check Render logs. Usually PORT configuration issue (already fixed in your code).

### Issue: "CORS error"
**Solution**: Make sure `FRONTEND_URL` environment variable matches your Vercel URL exactly.

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
- Verify `MONGO_URI` environment variable is correct

### Issue: "Cold start delay"
**Solution**: Free tier sleeps after 15 mins of inactivity. First request after sleep takes ~30 seconds. Upgrade to paid tier to avoid this.

## Important Notes

⚠️ **Free Tier Limitations:**
- Sleeps after 15 minutes of inactivity
- 750 hours/month free (enough for one always-on service)
- First request after sleep is slow (~30 seconds)

✅ **Production Checklist:**
- [ ] MongoDB Atlas cluster created
- [ ] All environment variables added to Render
- [ ] Frontend updated with backend URL
- [ ] CORS configured correctly
- [ ] Google OAuth callbacks updated (if applicable)
- [ ] Test all API endpoints from frontend

## Next Steps

After successful deployment:
1. Monitor logs in Render dashboard
2. Set up custom domain (optional)
3. Consider upgrading to paid tier for better performance
4. Set up monitoring/alerts

Your backend should now be live at: `https://your-backend-name.onrender.com` 🚀
