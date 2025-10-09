# FitTracker Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Google OAuth credentials (optional)
- Groq API key (optional, for AI features)

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Required Variables

- `MONGO_URI`: MongoDB connection string
- `SESSION_SECRET`: Random string for session encryption
- `NODE_ENV`: Set to "production" for production deployment

### Optional Variables

- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth login
- `GROQ_API_KEY`: For AI-powered features (diet suggestions, reports)
- `PORT`: Server port (default: 5000)

## Backend Deployment

### Option 1: Traditional VPS/Server

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp ../.env.example .env
   # Edit .env with your values
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Option 2: Railway/Render/Heroku

1. Connect your repository
2. Set environment variables in the platform's dashboard
3. Deploy

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist/client`
4. Set environment variables:
   - `VITE_API_URL`: Your backend URL

### Option 2: Netlify

1. Connect your repository
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist/client`
4. Set environment variables

### Option 3: Cloudflare Pages

1. Connect your repository
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist/client`
4. Configure wrangler.jsonc for Cloudflare Workers (already configured)

## Database Setup

### MongoDB Atlas (Recommended for production)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in your environment variables

### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/fittracker` as `MONGO_URI`

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - `https://your-domain.com/auth/google/callback` (production)
6. Copy Client ID and Secret to environment variables

## Groq API Setup (Optional)

1. Go to [Groq Console](https://console.groq.com/)
2. Create an account and get API key
3. Add to environment variables

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS in production
- [ ] Set secure session cookies
- [ ] Configure CORS for your frontend domain
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Test all features after deployment

## Troubleshooting

### Common Issues

1. **CORS errors**: Update CORS configuration in backend
2. **Database connection**: Check MongoDB URI and network access
3. **Session issues**: Ensure SESSION_SECRET is set
4. **Build failures**: Check Node.js version and dependencies

### Logs

Check application logs for errors:
- Backend: Console output or platform logs
- Frontend: Browser console and network tab

## Security Notes

- Never commit `.env` files
- Use strong, unique secrets
- Enable HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities