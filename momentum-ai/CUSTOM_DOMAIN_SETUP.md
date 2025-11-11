# 🌐 Custom Domain Setup Guide

## Your Domain Configuration

- **Custom Domain:** `www.momentumaicreator.com`
- **Vercel Deployment URL:** `momentumaicreator-hes5lyzux-cvader42s-projects.vercel.app`

---

## Step 1: Add Domain to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `momentumaicreator`

2. **Navigate to Domain Settings**
   - Click **Settings** tab
   - Click **Domains** in the left sidebar

3. **Add Your Domains**
   - Click **Add Domain**
   - Enter: `www.momentumaicreator.com`
   - Click **Add**
   - Repeat for: `momentumaicreator.com` (without www)

4. **Configure DNS Records**
   - Vercel will show you the DNS records to add
   - You'll need to add these to your domain registrar (GoDaddy, Namecheap, etc.)

---

## Step 2: Configure DNS Records

### Option A: Using A Record + CNAME (Recommended)

Add these records in your domain registrar's DNS settings:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### Option B: Using CNAME Records Only

```
Type    Name    Value
CNAME   @       cname.vercel-dns.com
CNAME   www     cname.vercel-dns.com
```

**Note:** Check Vercel's domain settings page for the exact records to use, as they may vary.

---

## Step 3: Update Environment Variables

After your domain is configured and SSL is issued (usually takes 5-10 minutes), update these environment variables in Vercel:

1. **Go to Vercel Dashboard → Settings → Environment Variables**

2. **Update/Add these variables:**

   ```
   FRONTEND_URL=https://www.momentumaicreator.com
   API_URL=https://www.momentumaicreator.com
   VITE_APP_URL=https://www.momentumaicreator.com
   ```

3. **If using server AI, also set:**
   ```
   VITE_API_URL=https://www.momentumaicreator.com
   ```
   
   **Important:**
   - `FRONTEND_URL` - Used for CORS and Stripe checkout redirects
   - `API_URL` - Used for OAuth redirect URIs (Instagram, Twitter, YouTube, etc.)
   - `VITE_APP_URL` - Used by frontend components

4. **Redeploy** after updating environment variables
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## Step 4: Update Landing Page Environment Variables

If you have a separate landing page project in Vercel:

1. **Go to Landing Page Project → Settings → Environment Variables**

2. **Add/Update:**
   ```
   VITE_APP_URL=https://www.momentumaicreator.com
   ```

3. **Redeploy** the landing page

---

## Step 5: Verify Everything Works

### Test Checklist:

- [ ] Domain resolves: Visit `https://www.momentumaicreator.com`
- [ ] SSL certificate is active (green padlock in browser)
- [ ] Homepage loads correctly
- [ ] Authentication works (test login/signup)
- [ ] Auth modal opens with `?showAuth=1` query param
- [ ] API routes work: Test `/api/*` endpoints
- [ ] Stripe checkout works
- [ ] AI features work (if using server AI)
- [ ] Landing page CTAs redirect to `https://www.momentumaicreator.com/dashboard?showAuth=1`

### Test Auth Modal:
Visit: `https://www.momentumaicreator.com/dashboard?showAuth=1`

The auth modal should open automatically.

---

## Step 6: Update Stripe Webhook URL

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/webhooks

2. **Update Webhook Endpoint**
   - Edit your existing webhook
   - Change URL to: `https://www.momentumaicreator.com/api/webhook`
   - Save changes

3. **Update Environment Variable**
   - In Vercel → Settings → Environment Variables
   - Update `STRIPE_WEBHOOK_SECRET` if it changed
   - Redeploy if needed

---

## Step 7: Update Firebase Authorized Domains

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Navigate to Authentication → Settings → Authorized domains**

3. **Add your custom domain:**
   - Click "Add domain"
   - Enter: `momentumaicreator.com`
   - Enter: `www.momentumaicreator.com`
   - Save

---

## Troubleshooting

### Domain Not Resolving
- **Wait 24-48 hours** for DNS propagation (usually faster, but can take time)
- Check DNS records are correct in your registrar
- Verify records in Vercel dashboard match your registrar

### SSL Certificate Not Issuing
- Ensure DNS records are correct
- Wait 10-15 minutes after adding domain
- Check Vercel dashboard for SSL status
- Contact Vercel support if issues persist

### Environment Variables Not Working
- Make sure you **redeployed** after adding variables
- Check variable names are exact (case-sensitive)
- Verify variables are set for **Production** environment
- Check Vercel deployment logs for errors

### Auth Modal Not Opening
- Verify `?showAuth=1` query param is in URL
- Check browser console for errors
- Verify `FRONTEND_URL` is set correctly
- Test with: `https://www.momentumaicreator.com/dashboard?showAuth=1`

### CORS Errors
- Verify `FRONTEND_URL` includes `https://` and no trailing slash
- Check CSP headers in `vercel.json` include your domain
- Verify Firebase authorized domains include your custom domain

---

## Quick Reference

**Your Domains:**
- Production: `https://www.momentumaicreator.com`
- Vercel: `https://momentumaicreator-hes5lyzux-cvader42s-projects.vercel.app`

**Environment Variables to Set:**
```
FRONTEND_URL=https://www.momentumaicreator.com
API_URL=https://www.momentumaicreator.com
VITE_APP_URL=https://www.momentumaicreator.com
```

**DNS Records:**
- A Record: `@` → `76.76.21.21`
- CNAME: `www` → `cname.vercel-dns.com`

**Test URLs:**
- Homepage: `https://www.momentumaicreator.com`
- Auth Test: `https://www.momentumaicreator.com/dashboard?showAuth=1`
- API Test: `https://www.momentumaicreator.com/api/health` (if you have a health endpoint)

---

## ✅ Completion Checklist

- [ ] Domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] Environment variables updated
- [ ] Project redeployed
- [ ] Landing page environment variables updated (if separate project)
- [ ] Stripe webhook URL updated
- [ ] Firebase authorized domains updated
- [ ] All tests passing
- [ ] Auth modal opens with `?showAuth=1`

---

**You're all set! Your custom domain should be live and working! 🚀**

