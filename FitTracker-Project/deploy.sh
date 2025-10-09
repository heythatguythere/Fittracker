#!/bin/bash

# FitTracker Deployment Script
# This script helps deploy the FitTracker application to Vercel

echo "🚀 FitTracker Deployment Script"
echo "================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please log in first:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"

# Deploy Backend
echo ""
echo "📦 Deploying Backend..."
cd backend

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found in backend directory"
    echo "   Please create a .env file with the required environment variables"
    echo "   See DEPLOYMENT_GUIDE.md for details"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Deploying backend to Vercel..."
vercel --prod

# Get the backend URL
BACKEND_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy Frontend
echo ""
echo "📦 Deploying Frontend..."
cd ../frontend

# Build the frontend
echo "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Deploy to Vercel
echo "Deploying frontend to Vercel..."
vercel --prod

# Get the frontend URL
FRONTEND_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""
echo "Next steps:"
echo "1. Test the application by visiting the frontend URL"
echo "2. Create a test account"
echo "3. Verify all features are working"
echo "4. Update CORS settings if needed"
echo ""
echo "For troubleshooting, see DEPLOYMENT_GUIDE.md"