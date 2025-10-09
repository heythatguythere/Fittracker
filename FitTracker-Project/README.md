# FitTracker - Full-Stack Fitness App

A comprehensive fitness tracking application built with React, Node.js, and MongoDB.

## 🚀 Quick Deploy to Vercel

**Ready to deploy?** Follow the [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) guide!

## ✨ Features

- **User Authentication** - Register, login, Google OAuth
- **Workout Tracking** - Log and track your workouts
- **Progress Monitoring** - Track measurements and progress
- **Diet Management** - Log meals and get AI-powered suggestions
- **Social Features** - Add friends and compete on leaderboards
- **Analytics** - Detailed reports and insights
- **Admin Dashboard** - Manage users and view statistics

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js
- Groq AI

### Deployment
- Vercel (Full-stack)
- MongoDB Atlas

## 📁 Project Structure

```
FitTracker-Project/
├── frontend/           # React frontend
├── backend/           # Node.js backend
│   ├── api/          # Vercel serverless functions
│   ├── models/       # MongoDB models
│   └── config/       # Configuration files
├── vercel.json       # Vercel configuration
└── package.json      # Root package.json
```

## 🚀 Deployment

### Option 1: Vercel (Recommended)
1. Follow [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. Set up MongoDB Atlas
3. Deploy with one click!

### Option 2: Manual Setup
1. Set up MongoDB Atlas
2. Configure environment variables
3. Deploy frontend and backend separately

## 🔧 Environment Variables

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fittracker
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
GROQ_API_KEY=your-groq-api-key (optional)
```

## 📱 Features Overview

### Authentication
- Email/password registration and login
- Google OAuth integration
- Session management
- Admin role support

### Workout Management
- Create and log workouts
- Exercise tracking with sets, reps, weight
- Workout templates
- Progress visualization

### Diet Tracking
- Meal logging with nutrition data
- AI-powered meal suggestions
- Calorie and macro tracking
- Food database integration

### Social Features
- Add friends by email
- Friend requests system
- Leaderboards and competitions
- Progress sharing

### Analytics
- Comprehensive fitness reports
- Progress charts and graphs
- Goal tracking
- Performance insights

## 🎯 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm run install-all`
3. **Set up environment variables**
4. **Deploy to Vercel** (see deployment guide)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.