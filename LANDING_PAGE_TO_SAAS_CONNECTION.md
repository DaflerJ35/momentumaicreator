# 🔗 Landing Page → SaaS App Connection Guide

## ✅ STATUS: All CTAs Are Configured!

All buttons on your landing page are **already connected** to redirect to your SaaS app!

---

## 🎯 All Connected Buttons:

### 1. **Hero Section** - "Start Free — No Credit Card"
- ✅ Routes to: `{VITE_APP_URL}/dashboard?showAuth=1`
- ✅ File: `HeroSection.tsx` (line 12)

### 2. **Navbar** - "Get Started" (Desktop)
- ✅ Routes to: `{VITE_APP_URL}/dashboard?showAuth=1`
- ✅ File: `Navbar.tsx` (line 78)

### 3. **Navbar** - "Get Started" (Mobile)
- ✅ Routes to: `{VITE_APP_URL}/dashboard?showAuth=1`
- ✅ File: `Navbar.tsx` (line 121)

### 4. **CTA Section** - "Start Free — No Credit Card"
- ✅ Routes to: `{VITE_APP_URL}/dashboard?showAuth=1`
- ✅ File: `CTASection.tsx` (line 12)

### 5. **Dashboard Showcase** - "Try the Dashboard Free"
- ✅ Routes to: `{VITE_APP_URL}/dashboard?showAuth=1`
- ✅ File: `DashboardShowcase.tsx` (line 219)

### 6. **Pricing Section** - Plan Buttons
- ✅ Routes to: `{VITE_APP_URL}/pricing?showAuth=1`
- ✅ File: `PricingSection.tsx` (line 17)

---

## 🔑 CRITICAL: Environment Variable Setup

**For the connection to work, you MUST set `VITE_APP_URL` in Vercel!**

### Step 1: Go to Vercel Dashboard
1. Open: https://vercel.com/dashboard
2. Select your **landing page project** (not the SaaS app)
3. Go to: **Settings** → **Environment Variables**

### Step 2: Add Environment Variable
- **Key:** `VITE_APP_URL`
- **Value:** `https://www.momentumaicreator.com`
- **Environments:** ✅ Production ✅ Preview ✅ Development

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## ✅ How It Works:

### When User Clicks a Button:
1. Button checks: `import.meta.env.VITE_APP_URL`
2. If set → Redirects to: `{VITE_APP_URL}/dashboard?showAuth=1`
3. SaaS app opens with `?showAuth=1` query param
4. SaaS app detects param → Opens auth modal automatically
5. User can sign up/login immediately!

### Example Flow:
```
User clicks "Start Free" 
→ Landing Page: window.location.href = "https://www.momentumaicreator.com/dashboard?showAuth=1"
→ SaaS App loads dashboard
→ App.jsx detects ?showAuth=1
→ Auth modal opens automatically
→ User signs up/logs in
```

---

## 🧪 Test the Connection:

### Test 1: Check Environment Variable
**In Vercel Dashboard:**
- Landing Page Project → Settings → Environment Variables
- Verify: `VITE_APP_URL = https://www.momentumaicreator.com`

### Test 2: Test a Button
**On Landing Page:**
1. Click "Start Free" button
2. Should redirect to: `https://www.momentumaicreator.com/dashboard?showAuth=1`
3. Auth modal should open automatically

### Test 3: Verify Auth Modal Opens
**On SaaS App:**
1. After redirect, check URL has `?showAuth=1`
2. Auth modal should open automatically
3. If not, check `App.jsx` has the query param detection code

---

## 🐛 Troubleshooting:

### Buttons Don't Redirect?
**Problem:** `VITE_APP_URL` not set or incorrect

**Fix:**
1. Check Vercel environment variables
2. Verify `VITE_APP_URL` is set for **Production** environment
3. Redeploy landing page after adding variable

### Redirects But Auth Modal Doesn't Open?
**Problem:** SaaS app not detecting `?showAuth=1`

**Fix:**
1. Check `momentum-ai/src/App.jsx` has query param detection
2. Verify the code:
   ```javascript
   useEffect(() => {
     const searchParams = new URLSearchParams(location.search);
     if (searchParams.get('showAuth') === '1') {
       setShowAuthModal(true);
       // Clear query param from URL
     }
   }, [location]);
   ```

### Buttons Fall Back to Scrolling?
**Problem:** `VITE_APP_URL` is empty or not set

**Fix:**
1. Set `VITE_APP_URL` in Vercel
2. Redeploy landing page
3. Clear browser cache

---

## 📋 Quick Checklist:

### Landing Page (Vercel):
- [ ] `VITE_APP_URL` environment variable set
- [ ] Value: `https://www.momentumaicreator.com`
- [ ] Set for Production, Preview, Development
- [ ] Landing page redeployed after setting variable

### SaaS App (Vercel):
- [ ] `FRONTEND_URL` environment variable set
- [ ] Value: `https://www.momentumaicreator.com`
- [ ] Auth modal query param detection code in `App.jsx`
- [ ] SaaS app deployed and live

### Test:
- [ ] Visit landing page
- [ ] Click "Start Free" button
- [ ] Should redirect to SaaS app
- [ ] Auth modal opens automatically
- [ ] Can sign up/login

---

## 🎯 Current Configuration:

### All Buttons Use This Pattern:
```javascript
const handleClick = () => {
  const appUrl = import.meta.env.VITE_APP_URL || '';
  if (appUrl) {
    window.location.href = `${appUrl}/dashboard?showAuth=1`;
  } else {
    // Fallback behavior (scroll to pricing, etc.)
  }
};
```

### SaaS App Detects This:
```javascript
// In App.jsx
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.get('showAuth') === '1') {
    setShowAuthModal(true);
    // Clear query param
  }
}, [location]);
```

---

## ✅ YOU'RE ALL SET!

**All buttons are configured correctly!**

**Just make sure:**
1. ✅ `VITE_APP_URL` is set in Vercel (landing page project)
2. ✅ Landing page is redeployed
3. ✅ SaaS app is live and has auth modal detection

**Then test it - it should work! 🚀**

---

## 🚀 Quick Action:

**Right now, do this:**
1. Go to Vercel → Landing Page Project → Settings → Environment Variables
2. Add/Verify: `VITE_APP_URL = https://www.momentumaicreator.com`
3. Redeploy landing page
4. Test a button - it should redirect to SaaS app!

---

**Everything is connected - just need to set the environment variable! 🎉**

