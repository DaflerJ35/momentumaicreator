# ✅ Complete Setup Checklist - Momentum AI Creator

## Your Configuration
- **Custom Domain:** `www.momentumaicreator.com`
- **Vercel Deployment:** `momentumaicreator-hes5lyzux-cvader42s-projects.vercel.app`

---

## Phase 1: Vercel Domain Setup

### 1.1 Add Custom Domain to Vercel
- [ ] Go to Vercel Dashboard → Your Project → Settings → Domains
- [ ] Add `www.momentumaicreator.com`
- [ ] Add `momentumaicreator.com` (without www)
- [ ] Configure DNS records as shown by Vercel
- [ ] Wait for SSL certificate (5-10 minutes)
- [ ] Verify domain resolves: `https://www.momentumaicreator.com`

**📖 Guide:** See `CUSTOM_DOMAIN_SETUP.md`

---

## Phase 2: Environment Variables (Main App)

### 2.1 Firebase Configuration
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_DATABASE_URL` (if using Realtime Database)
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` (if using Analytics)

### 2.2 AI Service
- [ ] `VITE_GOOGLE_GENERATIVE_AI_API_KEY` (Gemini API key)

### 2.3 Stripe Frontend
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (use LIVE key: `pk_live_...`)

### 2.4 App Configuration
- [ ] `VITE_APP_URL=https://www.momentumaicreator.com`
- [ ] `VITE_API_URL=https://www.momentumaicreator.com` (if using server AI)

### 2.5 Backend/Server Variables
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL=https://www.momentumaicreator.com` ⭐ **CRITICAL** (for CORS & redirects)
- [ ] `API_URL=https://www.momentumaicreator.com` ⭐ **CRITICAL** (for OAuth redirects)
- [ ] `STRIPE_SECRET_KEY` (use LIVE key: `sk_live_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` (from Stripe Dashboard)
- [ ] `STRIPE_MONTHLY_PRO_PRICE_ID`
- [ ] `STRIPE_MONTHLY_BUSINESS_PRICE_ID`
- [ ] `STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID`
- [ ] `STRIPE_6MONTH_PRO_PRICE_ID`
- [ ] `STRIPE_6MONTH_BUSINESS_PRICE_ID`
- [ ] `STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID`
- [ ] `STRIPE_YEARLY_PRO_PRICE_ID` (if applicable)
- [ ] `STRIPE_YEARLY_BUSINESS_PRICE_ID` (if applicable)
- [ ] `STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID` (if applicable)

### 2.6 Redeploy After Setting Variables
- [ ] Go to Deployments → Click "..." → Redeploy
- [ ] Wait for deployment to complete

**📖 Full List:** See `VERCEL_ENV_VARIABLES.md`

---

## Phase 3: Landing Page Setup (If Separate Project)

### 3.1 Landing Page Environment Variables
- [ ] `VITE_APP_URL=https://www.momentumaicreator.com`

### 3.2 Redeploy Landing Page
- [ ] Go to Landing Page Project → Deployments → Redeploy

**📖 Guide:** See `content-sphere-glowup-page/CUSTOM_DOMAIN_SETUP.md`

---

## Phase 4: Stripe Configuration

### 4.1 Update Stripe Webhook
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Update webhook endpoint to: `https://www.momentumaicreator.com/api/webhook`
- [ ] Select events: `checkout.session.completed`, `customer.subscription.updated`
- [ ] Copy webhook secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in Vercel if changed
- [ ] Redeploy if webhook secret changed

### 4.2 Verify Stripe Products
- [ ] Verify all price IDs match your Stripe products
- [ ] Test checkout flow in production

---

## Phase 5: Firebase Configuration

### 5.1 Authorized Domains
- [ ] Go to Firebase Console → Authentication → Settings → Authorized domains
- [ ] Add `momentumaicreator.com`
- [ ] Add `www.momentumaicreator.com`
- [ ] Verify Firebase project is in production mode

### 5.2 Firebase Security Rules (If Using Firestore)
- [ ] Review Firestore security rules
- [ ] Review Storage security rules
- [ ] Test rules in production

---

## Phase 6: Testing & Verification

### 6.1 Domain & SSL
- [ ] Visit `https://www.momentumaicreator.com` - loads correctly
- [ ] Visit `https://momentumaicreator.com` - redirects to www (if configured)
- [ ] SSL certificate is active (green padlock)
- [ ] No mixed content warnings

### 6.2 Authentication
- [ ] Test user signup
- [ ] Test user login
- [ ] Test password reset
- [ ] Test email verification (if enabled)
- [ ] Test auth modal opens with `?showAuth=1` query param
- [ ] Visit: `https://www.momentumaicreator.com/dashboard?showAuth=1`
- [ ] Auth modal should open automatically

### 6.3 Landing Page Integration
- [ ] Visit landing page
- [ ] Click "Get Started" or "Start Free — No Credit Card"
- [ ] Should redirect to: `https://www.momentumaicreator.com/dashboard?showAuth=1`
- [ ] Auth modal opens automatically

### 6.4 API Routes
- [ ] Test `/api/health` endpoint (if exists)
- [ ] Test Stripe checkout: `/api/create-checkout-session`
- [ ] Test webhook: `/api/webhook` (via Stripe)
- [ ] Verify CORS is working (no CORS errors in console)

### 6.5 Stripe Integration
- [ ] Test pricing page loads
- [ ] Test "Choose Plan" button opens checkout
- [ ] Test Stripe checkout flow (use test mode first)
- [ ] Test webhook receives events
- [ ] Test subscription upgrade/downgrade
- [ ] Verify payment success redirect works

### 6.6 AI Features
- [ ] Test AI content generation
- [ ] Test AI image generation (if enabled)
- [ ] Test AI video generation (if enabled)
- [ ] Verify API keys are working
- [ ] Check API usage/quotas

### 6.7 Core Features
- [ ] Test dashboard loads
- [ ] Test navigation works
- [ ] Test all main pages load
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test dark mode (if applicable)

---

## Phase 7: Security & Performance

### 7.1 Security Headers
- [ ] Verify CSP headers in browser dev tools
- [ ] Check for CSP violations in console
- [ ] Verify X-Content-Type-Options header
- [ ] Verify X-Frame-Options header
- [ ] Verify Referrer-Policy header

### 7.2 Performance
- [ ] Check Lighthouse score
- [ ] Verify images are optimized
- [ ] Check bundle size
- [ ] Test page load speed
- [ ] Verify code splitting works

### 7.3 Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics (Firebase Analytics, etc.)
- [ ] Monitor API usage
- [ ] Monitor Stripe webhook events

---

## Phase 8: Documentation & Maintenance

### 8.1 Documentation
- [ ] Update README with production URLs
- [ ] Document all environment variables
- [ ] Document deployment process
- [ ] Document troubleshooting steps

### 8.2 Backup & Recovery
- [ ] Backup environment variables
- [ ] Document rollback process
- [ ] Test deployment rollback

---

## Quick Test URLs

```
Homepage: https://www.momentumaicreator.com
Dashboard: https://www.momentumaicreator.com/dashboard
Auth Test: https://www.momentumaicreator.com/dashboard?showAuth=1
Pricing: https://www.momentumaicreator.com/pricing
API Health: https://www.momentumaicreator.com/api/health (if exists)
```

---

## Troubleshooting Quick Reference

### Domain Not Resolving
- Wait 24-48 hours for DNS propagation
- Check DNS records in registrar
- Verify records in Vercel dashboard

### SSL Certificate Not Issued
- Wait 10-15 minutes after adding domain
- Check Vercel dashboard for SSL status
- Verify DNS records are correct

### Environment Variables Not Working
- Verify you redeployed after adding variables
- Check variable names are exact (case-sensitive)
- Verify variables are set for Production environment
- Check Vercel deployment logs

### Auth Modal Not Opening
- Verify URL has `?showAuth=1` query param
- Check browser console for errors
- Verify `FRONTEND_URL` is set correctly

### CORS Errors
- Verify `FRONTEND_URL` includes `https://` and no trailing slash
- Check CSP headers in `vercel.json`
- Verify Firebase authorized domains

### Stripe Not Working
- Verify Stripe keys are LIVE keys (not test)
- Check webhook URL is correct
- Verify webhook secret is correct
- Check Stripe dashboard for webhook events

---

## Critical Environment Variables Summary

**Must Have:**
```
FRONTEND_URL=https://www.momentumaicreator.com
API_URL=https://www.momentumaicreator.com
VITE_APP_URL=https://www.momentumaicreator.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note:** `FRONTEND_URL` and `API_URL` should both be set to your custom domain for OAuth and redirects to work correctly.

---

## ✅ Final Verification

Before going live, verify:
- [ ] All environment variables are set
- [ ] Domain is configured and SSL is active
- [ ] Authentication works
- [ ] Stripe checkout works
- [ ] Landing page CTAs work
- [ ] Auth modal opens with `?showAuth=1`
- [ ] No console errors
- [ ] No CORS errors
- [ ] All features work as expected

---

**🎉 Once all checks are complete, your app is ready for production!**

