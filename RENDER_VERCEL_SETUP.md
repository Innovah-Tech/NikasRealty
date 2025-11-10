# Render Backend + Vercel Admin Panel Setup

## Problem
The admin panel on Vercel is getting a 404 error because it's trying to call `http://localhost:4000/api` instead of your Render backend URL.

## Solution

### Step 1: Set Environment Variable in Vercel (Admin Panel)

1. **Go to Vercel Dashboard**
   - Navigate to your admin panel project: `nikas-admin`

2. **Open Project Settings**
   - Click on your project → **Settings** → **Environment Variables**

3. **Add Environment Variable**
   - Click **Add New**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-render-backend-url.onrender.com/api`
     - Replace `your-render-backend-url` with your actual Render service name
     - Example: `https://nikasrealty-backend.onrender.com/api`
   - **Environment**: Select **Production** (and Preview if needed)
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on the latest deployment
   - Select **Redeploy**

### Step 2: Configure Render Backend Environment Variables

Make sure your Render backend has these environment variables set:

1. **Go to Render Dashboard**
   - Navigate to your backend service

2. **Open Environment Variables**
   - Go to **Environment** tab
   - Add/Update these variables:

```bash
JWT_SECRET=your-production-secret-key-min-32-chars
FRONTEND_URL=https://www.nikasrealtor.com
ADMIN_URL=https://nikas-admin.vercel.app
SEED_ADMIN_EMAIL=admin@nikasrealty.co.ke
SEED_ADMIN_PASSWORD=1250012093AcePortgasNikas
PORT=10000
```

**Important Notes:**
- `ADMIN_URL` must match your Vercel admin panel URL exactly (no trailing slash)
- `PORT` should be set to `10000` for Render (or whatever Render assigns)
- Render automatically provides a `PORT` environment variable, but you can set it explicitly

3. **Restart the Service**
   - After adding/updating environment variables, restart your Render service

### Step 3: Verify Backend is Running

Test your Render backend URL:

```bash
# Test health endpoint
curl https://your-render-backend-url.onrender.com/api/health

# Should return: {"status":"ok","message":"API is running 🚀"}
```

### Step 4: Test Login Endpoint

```bash
curl -X POST https://your-render-backend-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nikasrealty.co.ke","password":"1250012093AcePortgasNikas"}'

# Should return a JWT token
```

## Common Issues

### Still Getting 404?

1. **Check the URL format**
   - Must be: `https://your-service.onrender.com/api`
   - Include `/api` at the end
   - No trailing slash after `/api`

2. **Verify Render service is running**
   - Check Render dashboard to ensure service is "Live"
   - Check service logs for errors

3. **Redeploy Vercel after setting variable**
   - Environment variables only take effect after redeployment

### CORS Errors?

1. **Check ADMIN_URL in Render**
   - Must be exactly: `https://nikas-admin.vercel.app` (no trailing slash)
   - Case-sensitive

2. **Check Render service logs**
   - Look for CORS warnings in the logs
   - Should see: `⚠️ Blocked by CORS: [origin]` if there's a mismatch

3. **Restart Render service**
   - After updating environment variables, restart the service

### Backend Not Starting?

1. **Check Render logs**
   - Go to Render dashboard → Your service → Logs
   - Look for startup errors

2. **Verify JWT_SECRET is set**
   - Backend requires `JWT_SECRET` to start
   - Must be at least 32 characters for production

## Example Configuration

### Vercel (Admin Panel)
```
VITE_API_URL=https://nikasrealty-backend.onrender.com/api
```

### Render (Backend)
```
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
FRONTEND_URL=https://www.nikasrealtor.com
ADMIN_URL=https://nikas-admin.vercel.app
SEED_ADMIN_EMAIL=admin@nikasrealty.co.ke
SEED_ADMIN_PASSWORD=1250012093AcePortgasNikas
PORT=10000
```

## Quick Checklist

- [ ] Set `VITE_API_URL` in Vercel admin panel project
- [ ] Set `ADMIN_URL` in Render backend (must match Vercel URL exactly)
- [ ] Set `JWT_SECRET` in Render backend
- [ ] Set other required environment variables in Render
- [ ] Restart Render service after updating environment variables
- [ ] Redeploy Vercel admin panel after setting `VITE_API_URL`
- [ ] Test backend health endpoint
- [ ] Test login from admin panel


