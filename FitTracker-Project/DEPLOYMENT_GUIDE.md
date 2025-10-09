# FitTracker Deployment Guide

## Overview
This guide will help you deploy the FitTracker application to Vercel. The application consists of a React frontend and a Node.js backend with MongoDB.

## Prerequisites
- Vercel account
- MongoDB Atlas account (or another MongoDB hosting service)
- Google OAuth credentials (optional, for Google login)
- Groq API key (optional, for AI features)

## Environment Variables Required

### Backend Environment Variables
Create a `.env` file in the `/backend` directory with the following variables:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fittracker?retryWrites=true&w=majority

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Groq API (optional, for AI features)
GROQ_API_KEY=your-groq-api-key

# Environment
NODE_ENV=production
PORT=5000
```

### Frontend Environment Variables
The frontend doesn't require environment variables as it connects to the backend via API calls.

## Deployment Steps

### Step 1: Deploy Backend to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to backend directory**:
   ```bash
   cd FitTracker-Project/backend
   ```

3. **Initialize Vercel project**:
   ```bash
   vercel
   ```
   - Follow the prompts to link to your Vercel account
   - Choose the project name (e.g., "fittracker-backend")
   - Select the appropriate team if you have one

4. **Configure environment variables**:
   ```bash
   vercel env add MONGO_URI
   vercel env add SESSION_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GROQ_API_KEY
   vercel env add NODE_ENV
   ```

5. **Deploy**:
   ```bash
   vercel --prod
   ```

6. **Note the backend URL** (e.g., `https://fittracker-backend.vercel.app`)

### Step 2: Deploy Frontend to Vercel

1. **Navigate to frontend directory**:
   ```bash
   cd FitTracker-Project/frontend
   ```

2. **Initialize Vercel project**:
   ```bash
   vercel
   ```
   - Choose a different project name (e.g., "fittracker-frontend")
   - Select the appropriate team

3. **Update API endpoints** (if needed):
   - The frontend is configured to make API calls to `/api/*` endpoints
   - Update the backend URL in your frontend code if needed

4. **Deploy**:
   ```bash
   vercel --prod
   ```

### Step 3: Configure CORS (if needed)

If you encounter CORS issues, update the backend CORS configuration in `server.js`:

```javascript
app.use(cors({ 
  origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:5173'], 
  credentials: true 
}));
```

### Step 4: Update Frontend API Configuration

Update the frontend to use the correct backend URL. In your frontend code, ensure API calls are made to the correct backend URL.

## Database Setup

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs in development)
5. Get the connection string and use it as `MONGO_URI`

### Database Collections
The application will automatically create the following collections:
- `users` - User accounts
- `workouts` - Workout data
- `measurements` - Body measurements
- `dietentries` - Diet tracking
- `profiles` - User profiles
- `goals` - User goals
- `workouttemplates` - Workout templates

## Testing the Deployment

1. **Test Frontend**: Visit your frontend URL
2. **Test Registration**: Create a new account
3. **Test Login**: Log in with your account
4. **Test Features**: Try adding workouts, measurements, and diet entries
5. **Test Admin**: If you have admin access, test the admin dashboard

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Update CORS configuration in backend
   - Ensure frontend URL is whitelisted

2. **Database Connection Issues**:
   - Check MongoDB URI format
   - Ensure IP addresses are whitelisted
   - Check database user permissions

3. **Session Issues**:
   - Ensure SESSION_SECRET is set
   - Check cookie configuration

4. **Build Errors**:
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Check for TypeScript errors (if using strict mode)

### Logs
- Check Vercel function logs for backend errors
- Use browser developer tools for frontend errors
- Check MongoDB Atlas logs for database issues

## Production Considerations

1. **Security**:
   - Use strong session secrets
   - Enable HTTPS
   - Validate all inputs
   - Use environment variables for sensitive data

2. **Performance**:
   - Enable MongoDB indexing
   - Use CDN for static assets
   - Optimize images and assets

3. **Monitoring**:
   - Set up error tracking (e.g., Sentry)
   - Monitor API response times
   - Set up uptime monitoring

## Support

If you encounter issues:
1. Check the Vercel documentation
2. Review the application logs
3. Test locally first
4. Check database connectivity

## Next Steps

After successful deployment:
1. Set up a custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement backup strategies
5. Consider scaling options

---

**Note**: This is a full-stack application. Make sure both frontend and backend are deployed and properly configured for the application to work correctly.