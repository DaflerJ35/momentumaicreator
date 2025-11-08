# ⚡ QUICK DEPLOYMENT GUIDE - GET ONLINE IN 5 MINUTES

## 🚨 URGENT: Follow These Steps NOW

### Step 1: Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Fix deployment configuration"
git push origin main
```

### Step 2: Deploy to Vercel (3 minutes)

1. **Go to https://vercel.com**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure:**
   - Framework: **Vite**
   - Root Directory: **./** (default)
   - Build Command: **npm run build**
   - Output Directory: **dist**
   - Install Command: **npm install**

5. **Click "Deploy"** (don't add env vars yet - we'll do that after first deploy)

### Step 3: Get Your Deployment URL

After deployment completes, Vercel will give you a URL like:
`https://your-project.vercel.app`

### Step 4: Add Environment Variables (CRITICAL)

Go to **Project Settings → Environment Variables** and add ALL of these:

#### Frontend (VITE_ prefix required):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
VITE_GEMINI_API_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_APP_URL=https://your-project.vercel.app
```

#### Backend:
```
NODE_ENV=production
FRONTEND_URL=https://your-project.vercel.app
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRO_PRICE_ID=
STRIPE_MONTHLY_BUSINESS_PRICE_ID=
STRIPE_6MONTH_PRO_PRICE_ID=
STRIPE_YEARLY_BUSINESS_PRICE_ID=
```

### Step 5: Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

### Step 6: Test

Visit: `https://your-project.vercel.app`

- ✅ Homepage loads?
- ✅ Can sign in?
- ✅ API works? (`/api/health`)

---

## 🔥 If Deployment Fails:

### Error: "Build failed"
**Fix**: Check deployment logs, usually missing dependencies. Run `npm install` locally first.

### Error: "Module not found"
**Fix**: Make sure all dependencies are in `package.json`. Run `npm install` in root AND `server/` directory.

### Error: "Environment variable not found"
**Fix**: Add ALL environment variables in Vercel dashboard (see Step 4).

### Error: "API routes not working"
**Fix**: 
1. Verify `api/index.js` exists
2. Check Vercel Functions logs
3. Make sure server files are included

---

## 🎯 Minimum Viable Deployment (Get Online First)

If you don't have all API keys yet, you can deploy with minimal setup:

1. **Deploy without Stripe** (remove Stripe code temporarily)
2. **Deploy without Firebase** (app will warn but still work)
3. **Add features one by one** after basic deployment works

### Quick Test Without Full Setup:

```bash
# Test build locally first
npm run build

# If build succeeds, deploy will work
# Then add environment variables one by one
```

---

## 📞 Need Help RIGHT NOW?

1. **Check Vercel deployment logs** - They show exact errors
2. **Check browser console** - Shows frontend errors
3. **Test API endpoint**: `https://your-project.vercel.app/api/health`
4. **Verify environment variables** are set correctly

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Build succeeds (check logs)
- [ ] Environment variables added
- [ ] Site is accessible
- [ ] API endpoint works (`/api/health`)
- [ ] Can sign in (if Firebase configured)

---

**YOU CAN DO THIS!** 🚀

Follow the steps above exactly, and you'll be online within minutes.

