# Production Deployment Guide

## ✅ Current Setup
- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render

## 🔧 Configuration Steps

### 1. Render Backend Setup

**Environment Variables to Add in Render Dashboard:**
```
NODE_ENV=production
DATABASE_URL=<your_render_postgres_internal_url>
JWT_SECRET=<your_jwt_secret_key>
PAYSTACK_SECRET_KEY=<your_paystack_key>
FRONTEND_URL=https://your-app.vercel.app
PORT=5000
```

**After Deployment:**
- Your backend URL will be: `https://your-backend-name.onrender.com`
- Test it: `https://your-backend-name.onrender.com/api/health`

### 2. Vercel Frontend Setup

**Environment Variables to Add in Vercel Dashboard:**

Go to: **Project Settings → Environment Variables**

```
VITE_API_URL=https://your-backend-name.onrender.com/api
```

**Important:** After adding the environment variable, you MUST redeploy:
- Go to **Deployments** tab
- Click the three dots on the latest deployment
- Click **Redeploy**

### 3. Database Setup on Render

If using Render PostgreSQL:
1. Create a new PostgreSQL database in Render
2. Copy the **Internal Database URL**
3. Use it as `DATABASE_URL` in your backend environment variables

**Run Database Setup Scripts:**
- Go to Render Dashboard → Your Backend Service → **Shell**
- Run: `node scripts/fix_subscriptions_schema.js`

### 4. Update Backend CORS (Already Done ✅)

The backend is already configured to accept requests from:
- Your Vercel app
- localhost (for development)

### 5. Test the Deployment

1. **Test Backend Health:**
   ```
   https://your-backend-name.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try logging in
   - Check browser console for any CORS errors

## 🚨 Common Issues & Solutions

### Issue: "CORS Error" or "Network Error"
**Solution:**
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Ensure `VITE_API_URL` in Vercel is correct
- Redeploy both frontend and backend

### Issue: "Database Connection Error"
**Solution:**
- Check `DATABASE_URL` is the **Internal** URL (not External)
- Verify database is in the same region as backend
- Check database is running

### Issue: "401 Unauthorized" on all requests
**Solution:**
- Cookies might not work across domains
- Ensure `credentials: 'include'` is set in frontend API calls
- Check `FRONTEND_URL` in backend CORS config

### Issue: Render Free Tier Sleeps
**Solution:**
- First request after 15min will be slow (cold start)
- Upgrade to paid plan for always-on service
- Or use a cron job to ping your backend every 10 minutes

## 📝 Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Database created and connected
- [ ] All environment variables set in Render
- [ ] Database setup scripts run
- [ ] Frontend environment variable set in Vercel
- [ ] Frontend redeployed after env var change
- [ ] Health endpoint tested
- [ ] Login functionality tested
- [ ] CORS working (no console errors)

## 🔄 Future Deployments

**Backend Updates:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Render will auto-deploy on push to main branch.

**Frontend Updates:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```
Vercel will auto-deploy on push to main branch.

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console for frontend errors
