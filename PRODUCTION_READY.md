# 🚀 Production Ready - Final Checklist

## ✅ Domain Setup Complete
- [x] Domain added to Vercel: `www.momentumaicreator.com`

---

## 🔑 Environment Variables to Set in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Critical Variables (MUST SET):

```
FRONTEND_URL=https://www.momentumaicreator.com
API_URL=https://www.momentumaicreator.com
VITE_APP_URL=https://www.momentumaicreator.com
```

### Firebase Variables:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=your_database_url (if using)
```

### Stripe Variables:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRO_PRICE_ID=price_...
STRIPE_MONTHLY_BUSINESS_PRICE_ID=price_...
STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID=price_...
STRIPE_6MONTH_PRO_PRICE_ID=price_...
STRIPE_6MONTH_BUSINESS_PRICE_ID=price_...
STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID=price_...
```

### AI Service:
```
VITE_GOOGLE_GENERATIVE_AI_API_KEY=your_key
```

### Server Configuration:
```
NODE_ENV=production
```

---

## 🔄 After Setting Variables

1. **Redeploy** in Vercel:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete

2. **Verify Deployment:**
   - Check deployment logs for errors
   - Verify all environment variables are loaded

---

## 🔧 Additional Configuration

### 1. Update Stripe Webhook

1. Go to **Stripe Dashboard** → **Webhooks**
2. Update webhook endpoint to: `https://www.momentumaicreator.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel if changed
6. Redeploy if secret changed

### 2. Update Firebase Authorized Domains

1. Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Add: `momentumaicreator.com`
3. Add: `www.momentumaicreator.com`
4. Save

### 3. Update Landing Page (If Separate Project)

1. Go to **Landing Page Vercel Project** → **Settings** → **Environment Variables**
2. Add: `VITE_APP_URL=https://www.momentumaicreator.com`
3. Redeploy landing page

---

## ✅ Testing Checklist

After redeploying, test these:

### Domain & SSL
- [ ] Visit `https://www.momentumaicreator.com` - loads correctly
- [ ] SSL certificate is active (green padlock)
- [ ] No mixed content warnings

### Authentication
- [ ] Visit `https://www.momentumaicreator.com/dashboard?showAuth=1`
- [ ] Auth modal opens automatically
- [ ] Can sign up new user
- [ ] Can log in existing user
- [ ] Can reset password

### Landing Page Integration
- [ ] Visit landing page
- [ ] Click "Get Started" button
- [ ] Redirects to: `https://www.momentumaicreator.com/dashboard?showAuth=1`
- [ ] Auth modal opens

### API Routes
- [ ] Test `/api/health` endpoint (if exists)
- [ ] Test `/api/create-checkout-session` (Stripe)
- [ ] Test `/api/ai/generate` (AI generation)
- [ ] No CORS errors in console

### Stripe Integration
- [ ] Visit pricing page
- [ ] Click "Choose Plan" button
- [ ] Stripe checkout opens
- [ ] Can complete test payment
- [ ] Webhook receives events

### Core Features
- [ ] Dashboard loads
- [ ] Navigation works
- [ ] All pages load
- [ ] Responsive design works
- [ ] Dark mode works (if applicable)

---

## 🐛 Troubleshooting

### Environment Variables Not Working
- **Check:** Variable names are exact (case-sensitive)
- **Check:** Variables are set for **Production** environment
- **Check:** You redeployed after adding variables
- **Check:** Vercel deployment logs for errors

### CORS Errors
- **Check:** `FRONTEND_URL` is set correctly
- **Check:** `FRONTEND_URL` includes `https://` and no trailing slash
- **Check:** Browser console for specific CORS errors
- **Check:** CSP headers in `vercel.json`

### Auth Modal Not Opening
- **Check:** URL has `?showAuth=1` query param
- **Check:** Browser console for errors
- **Check:** `FRONTEND_URL` is set correctly
- **Check:** Firebase authorized domains include your domain

### Stripe Not Working
- **Check:** Stripe keys are LIVE keys (not test)
- **Check:** Webhook URL is correct
- **Check:** Webhook secret is correct
- **Check:** Stripe dashboard for webhook events
- **Check:** Browser console for errors

### API Routes Not Working
- **Check:** `API_URL` is set correctly
- **Check:** Serverless function logs in Vercel
- **Check:** Environment variables are set
- **Check:** `api/index.js` is correctly configured

---

## 🎯 Quick Verification Commands

### Check Environment Variables (in Vercel)
1. Go to **Settings** → **Environment Variables**
2. Verify all variables are listed
3. Check they're set for **Production**

### Check Deployment Status
1. Go to **Deployments** tab
2. Check latest deployment status
3. View deployment logs for errors

### Check Domain Status
1. Go to **Settings** → **Domains**
2. Verify domain is configured
3. Check SSL certificate status

---

## 📊 Monitoring

### Set Up Monitoring (Optional but Recommended)

1. **Error Tracking:**
   - Set up Sentry or similar
   - Monitor for runtime errors

2. **Analytics:**
   - Firebase Analytics
   - Google Analytics
   - Vercel Analytics

3. **Performance:**
   - Vercel Analytics
   - Lighthouse scores
   - Core Web Vitals

4. **API Monitoring:**
   - Monitor API response times
   - Track API errors
   - Monitor Stripe webhook events

---

## 🚀 Final Steps

1. **Set all environment variables in Vercel**
2. **Redeploy the application**
3. **Update Stripe webhook URL**
4. **Update Firebase authorized domains**
5. **Test all features**
6. **Monitor for errors**

---

## ✅ Success Criteria

Your app is live when:

- [ ] Domain resolves: `https://www.momentumaicreator.com`
- [ ] SSL certificate is active
- [ ] Authentication works
- [ ] Stripe checkout works
- [ ] API routes work
- [ ] Landing page CTAs work
- [ ] Auth modal opens with `?showAuth=1`
- [ ] No console errors
- [ ] No CORS errors

---

## 🎉 You're Ready!

Once all environment variables are set and you've redeployed, your app should be live!

**Next:** Set the environment variables, redeploy, and test!

---

## 📞 Need Help?

- Check deployment logs in Vercel
- Check browser console for errors
- Verify environment variables are set correctly
- Test each feature individually
- Check Stripe dashboard for webhook events
- Check Firebase console for auth issues

---

**Let's get this live! 🚀**

