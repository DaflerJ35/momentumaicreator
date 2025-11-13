# 🚀 Final Deployment Steps - Get Live NOW!

## ✅ Domain Already Added
Great! Your domain `www.momentumaicreator.com` is already configured in Vercel.

---

## Step 1: Set Environment Variables (5 minutes)

### Go to Vercel Dashboard:
1. **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

### Add These Critical Variables (Production):
```
# Backend/Server Variables
NODE_ENV=production
FRONTEND_URL=https://www.momentumaicreator.com
API_URL=https://www.momentumaicreator.com

# Frontend Variables
VITE_APP_URL=https://www.momentumaicreator.com
VITE_USE_SERVER_AI=true
VITE_API_URL=https://www.momentumaicreator.com
```

### Verify These Are Also Set:
- [ ] All `VITE_FIREBASE_*` variables
- [ ] `VITE_GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] All Stripe price IDs
- [ ] `TOKEN_ENCRYPTION_KEY` (64-character hex)
- [ ] `OAUTH_STATE_SECRET` (64-character hex)
- [ ] All platform OAuth credentials (if using platform integrations)

**⚠️ CRITICAL:**
- Set `NODE_ENV=production` (NOT `development`)
- Remove any localhost entries from production environment variables
- Set `VITE_USE_SERVER_AI=true` if using server AI
- Set `VITE_API_URL` to production domain (same origin if API is serverless)

**⚠️ IMPORTANT:** Make sure variables are set for **Production** environment!

---

## Step 2: Redeploy (2 minutes)

1. Go to **Deployments** tab
2. Click **"..."** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (usually 2-3 minutes)
5. Check deployment logs for any errors

---

## Step 3: Update Stripe Webhook (2 minutes)

1. Go to **Stripe Dashboard** → **Webhooks**
2. Find your webhook endpoint
3. Update URL to: `https://www.momentumaicreator.com/api/webhook`
4. Verify events selected:
   - `checkout.session.completed`
   - `customer.subscription.updated`
5. Save changes
6. If webhook secret changed, update `STRIPE_WEBHOOK_SECRET` in Vercel
7. Redeploy if secret changed

---

## Step 4: Update Firebase (1 minute)

1. Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Click **Add domain**
3. Add: `momentumaicreator.com`
4. Click **Add domain** again
5. Add: `www.momentumaicreator.com`
6. Save

---

## Step 5: Test Everything (5 minutes)

### Quick Tests:

1. **Homepage:**
   - Visit: `https://www.momentumaicreator.com`
   - Should load without errors

2. **Auth Modal:**
   - Visit: `https://www.momentumaicreator.com/dashboard?showAuth=1`
   - Auth modal should open automatically

3. **Pricing:**
   - Visit: `https://www.momentumaicreator.com/pricing`
   - Should show all pricing plans

4. **Stripe Checkout:**
   - Click "Choose Plan" on pricing page
   - Stripe checkout should open

5. **Landing Page (if separate):**
   - Visit your landing page
   - Click "Get Started"
   - Should redirect to app with auth modal opening

---

## Step 6: Verify Environment Variables (1 minute)

### In Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Verify these are set:
   - ✅ `FRONTEND_URL=https://www.momentumaicreator.com`
   - ✅ `API_URL=https://www.momentumaicreator.com`
   - ✅ `VITE_APP_URL=https://www.momentumaicreator.com`
3. Verify they're set for **Production** environment

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Domain resolves: `https://www.momentumaicreator.com`
- [ ] SSL certificate is active (green padlock)
- [ ] Homepage loads without errors
- [ ] Auth modal opens with `?showAuth=1`
- [ ] Can sign up/login
- [ ] Pricing page loads
- [ ] Stripe checkout works
- [ ] No console errors
- [ ] No CORS errors
- [ ] Landing page CTAs work (if separate)

---

## 🐛 Quick Troubleshooting

### Environment Variables Not Working?
- ✅ Make sure you **redeployed** after adding variables
- ✅ Check variable names are exact (case-sensitive)
- ✅ Verify variables are set for **Production** environment

### Auth Modal Not Opening?
- ✅ Check URL has `?showAuth=1`
- ✅ Verify `FRONTEND_URL` is set correctly
- ✅ Check browser console for errors
- ✅ Verify Firebase authorized domains

### CORS Errors?
- ✅ Verify `FRONTEND_URL` includes `https://` and no trailing slash
- ✅ Check CSP headers in `vercel.json`
- ✅ Verify domain matches exactly

### Stripe Not Working?
- ✅ Verify Stripe keys are LIVE keys (not test)
- ✅ Check webhook URL is correct
- ✅ Verify webhook secret is correct
- ✅ Check Stripe dashboard for webhook events

---

## 🎯 Next Actions

1. **Set environment variables** (Step 1)
2. **Redeploy** (Step 2)
3. **Update Stripe webhook** (Step 3)
4. **Update Firebase** (Step 4)
5. **Test everything** (Step 5)

---

## 📊 Monitor Deployment

### Check Deployment Status:
1. Go to **Deployments** tab in Vercel
2. Watch deployment progress
3. Check deployment logs for errors
4. Verify deployment completes successfully

### Check Deployment Logs:
1. Click on latest deployment
2. Click **View Function Logs** (if available)
3. Look for any errors or warnings
4. Verify environment variables are loaded

---

## 🎉 You're Almost There!

**Complete these 6 steps and your app will be live!**

1. ✅ Set environment variables
2. ✅ Redeploy
3. ✅ Update Stripe webhook
4. ✅ Update Firebase
5. ✅ Test everything
6. ✅ Verify success

---

## 🚨 Still Need Help?

### Check These:
1. **Vercel Deployment Logs** - Look for errors
2. **Browser Console** - Check for JavaScript errors
3. **Network Tab** - Check for failed requests
4. **Environment Variables** - Verify all are set correctly
5. **Stripe Dashboard** - Check for webhook events
6. **Firebase Console** - Check for auth issues

---

## 📚 Reference Docs

- **Complete Setup:** `COMPLETE_SETUP_CHECKLIST.md`
- **Environment Variables:** `VERCEL_ENV_VARIABLES.md`
- **Verify Live:** `VERIFY_LIVE.md`
- **Production Ready:** `PRODUCTION_READY.md`

---

**Let's get this live! Follow the steps above and you'll be done in 15 minutes! 🚀**

