# ✅ Verify Your App is Live

## Quick Test URLs

Test these URLs after deployment:

### 1. Homepage
```
https://www.momentumaicreator.com
```
**Expected:** App loads, no errors

### 2. Auth Modal Test
```
https://www.momentumaicreator.com/dashboard?showAuth=1
```
**Expected:** Auth modal opens automatically

### 3. Dashboard
```
https://www.momentumaicreator.com/dashboard
```
**Expected:** Dashboard loads (or redirects to login)

### 4. Pricing Page
```
https://www.momentumaicreator.com/pricing
```
**Expected:** Pricing page loads with all plans

### 5. API Health Check (if exists)
```
https://www.momentumaicreator.com/api/health
```
**Expected:** Returns JSON response

---

## Browser Console Check

Open browser DevTools (F12) and check:

### No Errors
- [ ] No red errors in console
- [ ] No CORS errors
- [ ] No network errors
- [ ] No CSP violations

### Network Tab
- [ ] All resources load (200 status)
- [ ] API calls succeed
- [ ] Firebase connects
- [ ] Stripe loads

---

## Feature Tests

### Authentication
- [ ] Can click "Sign Up"
- [ ] Can click "Log In"
- [ ] Can enter email/password
- [ ] Can submit form
- [ ] Auth works with Firebase

### Stripe
- [ ] Pricing page loads
- [ ] Can click "Choose Plan"
- [ ] Stripe checkout opens
- [ ] Can enter test card
- [ ] Can complete checkout

### Landing Page (if separate)
- [ ] Landing page loads
- [ ] Can click "Get Started"
- [ ] Redirects to app with `?showAuth=1`
- [ ] Auth modal opens

---

## Environment Variable Verification

Check in Vercel Dashboard:

### Must Have:
- [ ] `FRONTEND_URL=https://www.momentumaicreator.com`
- [ ] `API_URL=https://www.momentumaicreator.com`
- [ ] `VITE_APP_URL=https://www.momentumaicreator.com`
- [ ] All Firebase variables set
- [ ] All Stripe variables set
- [ ] `NODE_ENV=production`

---

## SSL Certificate Check

- [ ] Green padlock in browser
- [ ] URL shows `https://`
- [ ] No "Not Secure" warnings
- [ ] Certificate is valid

---

## Common Issues & Fixes

### Issue: Page Not Loading
**Fix:**
- Check DNS propagation (wait 24-48 hours)
- Check Vercel domain configuration
- Check deployment status

### Issue: Auth Modal Not Opening
**Fix:**
- Verify `?showAuth=1` is in URL
- Check `FRONTEND_URL` is set correctly
- Check browser console for errors
- Verify Firebase authorized domains

### Issue: CORS Errors
**Fix:**
- Verify `FRONTEND_URL` is set correctly
- Check CSP headers in `vercel.json`
- Verify domain matches exactly

### Issue: Stripe Not Working
**Fix:**
- Verify Stripe keys are LIVE keys
- Check webhook URL is correct
- Verify webhook secret is correct
- Check Stripe dashboard for events

### Issue: API Routes Not Working
**Fix:**
- Verify `API_URL` is set correctly
- Check serverless function logs
- Verify environment variables are set
- Check `api/index.js` configuration

---

## ✅ All Green?

If all tests pass:
- 🎉 **Your app is live!**
- ✅ Domain is working
- ✅ SSL is active
- ✅ Authentication works
- ✅ Stripe works
- ✅ API routes work

---

## 🚨 Still Having Issues?

1. **Check Vercel Deployment Logs**
   - Go to Deployments → Click latest deployment → View logs

2. **Check Browser Console**
   - Open DevTools → Console tab
   - Look for errors

3. **Check Network Tab**
   - Open DevTools → Network tab
   - Look for failed requests

4. **Verify Environment Variables**
   - Go to Vercel → Settings → Environment Variables
   - Verify all variables are set

5. **Test Individual Features**
   - Test auth separately
   - Test Stripe separately
   - Test API routes separately

---

**You've got this! 🚀**

