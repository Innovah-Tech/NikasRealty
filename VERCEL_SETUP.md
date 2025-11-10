# Vercel Deployment Setup Guide

## Admin Panel Environment Variable

The admin panel deployed on Vercel needs the `VITE_API_URL` environment variable set to point to your backend API.

### Step-by-Step Instructions:

1. **Go to your Vercel Dashboard**
   - Navigate to your admin panel project: `nikas-admin`

2. **Open Project Settings**
   - Click on your project → **Settings** → **Environment Variables**

3. **Add Environment Variable**
   - Click **Add New**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.com/api`
     - Replace `your-backend-url.com` with your actual backend URL
     - Example: `https://nikasrealty-api.vercel.app/api`
   - **Environment**: Select **Production** (and Preview if needed)
   - Click **Save**

4. **Redeploy Your Application**
   - Go to **Deployments** tab
   - Click the **⋯** (three dots) on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger a redeploy

### Important Notes:

- **Variable Name**: Must be `VITE_API_URL` (with `VITE_` prefix for Vite apps)
- **Value Format**: Must include `/api` at the end
- **No Trailing Slash**: Don't add a trailing slash after `/api`
- **Redeploy Required**: Changes only take effect after redeployment

### Example Values:

**If your backend is on Vercel:**
```
VITE_API_URL=https://nikasrealty-api.vercel.app/api
```

**If your backend is on another platform:**
```
VITE_API_URL=https://api.nikasrealtor.com/api
```

**If your backend is on a custom domain:**
```
VITE_API_URL=https://backend.nikasrealtor.com/api
```

## Backend Environment Variables (if deploying to Vercel)

If you're deploying the backend to Vercel, set these variables:

```bash
JWT_SECRET=your-production-secret-key-min-32-chars
FRONTEND_URL=https://www.nikasrealtor.com
ADMIN_URL=https://nikas-admin.vercel.app
SEED_ADMIN_EMAIL=admin@nikasrealty.co.ke
SEED_ADMIN_PASSWORD=1250012093AcePortgasNikas
```

## Troubleshooting

### Still seeing localhost:4000?
1. Check that `VITE_API_URL` is set correctly in Vercel
2. Make sure you selected the correct environment (Production)
3. **Redeploy** your application after adding the variable
4. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### CORS Errors?
- Make sure your backend has `ADMIN_URL=https://nikas-admin.vercel.app` in its CORS configuration
- Check that the backend is running and accessible

### 404 Errors?
- Verify your backend URL is correct
- Make sure the backend API is deployed and running
- Check that the `/api` path is correct in your backend routes


