# 🚀 DEPLOYMENT CHECKLIST - GET ONLINE NOW

## CRITICAL: Follow these steps EXACTLY to deploy

### Step 1: Pre-Deployment Checks ✅

- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in `server/` directory  
- [ ] Test build locally: `npm run build`
- [ ] Verify `dist/` folder is created after build

### Step 2: Vercel Setup (Recommended - Fastest)

#### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your repository

#### 2.2 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 2.3 Set Environment Variables in Vercel Dashboard

**FRONTEND VARIABLES (Vite requires VITE_ prefix):**
```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GEMINI_API_KEY=your_gemini_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
VITE_APP_URL=https://your-domain.vercel.app
```

**BACKEND VARIABLES (Server):**
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs - GET THESE FROM STRIPE DASHBOARD
STRIPE_MONTHLY_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_MONTHLY_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxx

STRIPE_6MONTH_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_6MONTH_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxx

STRIPE_YEARLY_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_YEARLY_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxx

# Optional: Email (Contact Form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Momentum AI
SMTP_FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=support@yourdomain.com
```

#### 2.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Check deployment logs for errors
4. Visit your deployed URL

### Step 3: Common Issues & Quick Fixes

#### Issue: Build Fails
**Fix**: Check that all dependencies are in `package.json` and run `npm install` locally first

#### Issue: API Routes Not Working
**Fix**: 
1. Verify `api/index.js` exists
2. Check that server files are in `server/` directory
3. Verify environment variables are set in Vercel dashboard

#### Issue: Firebase Not Working
**Fix**:
1. Double-check all `VITE_FIREBASE_*` variables are set
2. Verify Firebase project is set to production mode
3. Check Firebase console for API restrictions

#### Issue: Stripe Not Working
**Fix**:
1. Use LIVE keys (pk_live_ and sk_live_) in production
2. Verify webhook URL in Stripe dashboard: `https://your-domain.vercel.app/api/webhook`
3. Get webhook secret from Stripe dashboard

#### Issue: CORS Errors
**Fix**: 
1. Set `FRONTEND_URL` to your exact Vercel domain
2. Add domain to Firebase authorized domains
3. Check `server/middleware/security.js` CORS settings

### Step 4: Post-Deployment Verification

- [ ] Visit your site: `https://your-domain.vercel.app`
- [ ] Test authentication (sign in/out)
- [ ] Test API endpoint: `https://your-domain.vercel.app/api/health`
- [ ] Test Stripe checkout (use test mode first)
- [ ] Check browser console for errors
- [ ] Test on mobile device

### Step 5: Custom Domain (Optional but Recommended)

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` and `VITE_APP_URL` to custom domain
5. Update Firebase authorized domains
6. Redeploy

### Emergency Deployment (If Vercel Fails)

#### Option A: Netlify
1. Go to https://netlify.com
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables (same as above)
6. Deploy

#### Option B: Render
1. Go to https://render.com
2. Create Web Service
3. Connect GitHub repo
4. Build command: `npm run build && cd server && npm install`
5. Start command: `cd server && npm start`
6. Add environment variables
7. Deploy

### Quick Test Commands

```bash
# Test build locally
npm run build

# Test server locally
cd server
npm start

# Check for missing dependencies
npm audit

# Verify environment variables (in server directory)
node -e "require('dotenv').config(); console.log(process.env.STRIPE_SECRET_KEY ? 'Stripe OK' : 'Stripe MISSING')"
```

### Support Resources

- Vercel Docs: https://vercel.com/docs
- Firebase Console: https://console.firebase.google.com
- Stripe Dashboard: https://dashboard.stripe.com
- Project README: See `README.md` for detailed setup

---

## ⚠️ CRITICAL REMINDERS

1. **NEVER commit `.env` files to Git**
2. **Use LIVE Stripe keys in production** (not test keys)
3. **Set all environment variables in Vercel dashboard**
4. **Test in production mode before announcing launch**
5. **Monitor Vercel deployment logs for errors**

---

## 🆘 If Still Not Working

1. Check Vercel deployment logs (most common issue is missing env vars)
2. Check browser console for errors
3. Verify all API keys are correct
4. Test API endpoint: `/api/health` should return `{"status":"ok"}`
5. Check Firebase console for auth errors
6. Verify Stripe webhook is configured

**Last Resort**: Share your Vercel deployment URL and error logs for help debugging.

