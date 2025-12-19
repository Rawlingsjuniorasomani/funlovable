# Vercel Deployment Fix

## Changes Made

1. **Updated `vercel.json`** - Configured proper API routing
2. **Created `api/index.js`** - Serverless function wrapper for Express app
3. **Modified `backend/src/server.js`** - Made server start conditional and exported app

## Required Environment Variables on Vercel

You MUST add these environment variables in your Vercel project settings:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET_KEY=your_paystack_key
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Deployment Steps

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Fix Vercel serverless deployment"
   git push
   ```

2. **In Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all required variables listed above
   - Redeploy the project

3. **Important Notes**:
   - Socket.io may not work properly in serverless (consider using Vercel's Edge Functions or separate WebSocket server)
   - Database connections should use connection pooling
   - Consider using Vercel Postgres or external PostgreSQL with SSL

## Alternative: Separate Backend Deployment

For better performance, consider deploying backend separately on:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

Then update frontend API_URL to point to that backend.
