# 🚀 DEPLOY TO VERCEL NOW - Quick Guide

## Option 1: Push to GitHub (Auto-Deploy if connected)
If Vercel is already connected to your GitHub repo, just push:

```bash
git push origin main
```

Vercel will automatically deploy!

## Option 2: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with your GitHub account

2. **Import Project (if not already imported)**
   - Click "Add New" → "Project"
   - Import `DaflerJ35/momentumaicreator`
   - Or click "Import" if you see it

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of repo)
   - **Build Command**: `pnpm run build` (or `npm run build`)
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` (or `npm install`)

4. **Add Environment Variables**
   Go to Settings → Environment Variables and add:

   ### Required Frontend Variables:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=your_database_url
   VITE_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

   ### Required Backend Variables (for API routes):
   ```
   STRIPE_SECRET_KEY=your_stripe_secret
   FRONTEND_URL=https://www.momentumaicreator.com
   API_URL=https://www.momentumaicreator.com
   NODE_ENV=production
   ```
   
   **Important:** 
   - Use your custom domain `https://www.momentumaicreator.com` for both `FRONTEND_URL` and `API_URL`
   - `FRONTEND_URL` is used for CORS and redirects
   - `API_URL` is used for OAuth redirect URIs (Instagram, Twitter, etc.)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

## Option 3: Use Vercel CLI (Alternative)

If CLI works on your system:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## ✅ What's Already Configured

- ✅ `vercel.json` - API routing configured
- ✅ `api/index.js` - Serverless function entry point
- ✅ Build command - `pnpm run build`
- ✅ Output directory - `dist`
- ✅ Security headers - CSP, CORS, etc.

## 🎯 After Deployment

1. **Set up Custom Domain** (www.momentumaicreator.com)
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add `www.momentumaicreator.com` and `momentumaicreator.com`
   - Follow Vercel's DNS instructions to configure your domain
   - Wait for SSL certificate to be issued (usually takes a few minutes)

2. **Update Environment Variables** with your custom domain:
   - `FRONTEND_URL=https://www.momentumaicreator.com`
   - `VITE_APP_URL=https://www.momentumaicreator.com` (if using server AI)

3. **Test the app**
   - Visit `https://www.momentumaicreator.com`
   - Check API routes - Test `/api/*` endpoints
   - Verify Firebase - Test authentication
   - Test Stripe - Verify checkout flow
   - Test auth modal - Visit `https://www.momentumaicreator.com/dashboard?showAuth=1`

## 🔍 Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### API Routes Not Working
- Verify `api/index.js` exists
- Check serverless function logs in Vercel
- Ensure backend environment variables are set

### CORS Errors
- Update `FRONTEND_URL` to your Vercel URL
- Check CSP headers in `vercel.json`

## 🚀 Ready to Rock!

Your app is configured and ready to deploy. Choose any option above and you're good to go!
