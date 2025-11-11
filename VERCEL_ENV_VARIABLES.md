# 🔐 Adding Environment Variables to Vercel

## ✅ Yes! You can add your `.env` variables directly to Vercel!

All the `VITE_` prefixed variables from your `.env` file need to be added to Vercel's Environment Variables section.

---

## 📋 Step-by-Step: Adding Environment Variables to Vercel

### Step 1: Go to Your Project Settings
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (`momentumaicreator`)
3. Click on **"Settings"** tab
4. Click on **"Environment Variables"** in the left sidebar

### Step 2: Add Each Variable
For each variable below, click **"Add New"** and enter:

**Key:** The variable name (e.g., `VITE_FIREBASE_API_KEY`)  
**Value:** Your actual value from your `.env` file  
**Environment:** Select **Production**, **Preview**, and **Development** (or just Production if you want)

### Step 3: Save and Redeploy
After adding all variables:
1. Click **"Save"** for each variable
2. Go to **"Deployments"** tab
3. Click the **"..."** menu on your latest deployment
4. Click **"Redeploy"** to apply the new environment variables

---

## 🔑 Required Environment Variables for Momentum AI Creator

Copy these from your `.env` file and add them to Vercel:

### Firebase Configuration (Required)
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### Google Gemini AI (Required)
```
VITE_GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```


### App Configuration (Optional)
```
VITE_APP_URL=https://yourdomain.com
```

### Backend/Server Variables (Required for API routes)
```
NODE_ENV=production
FRONTEND_URL=https://www.momentumaicreator.com
API_URL=https://www.momentumaicreator.com
```

### Platform OAuth Credentials (Required for platform integrations)

**⚠️ IMPORTANT: OAuth Callback URLs**

Before configuring OAuth credentials, you must set up the callback URLs in each platform's developer dashboard. The callback URLs follow this pattern:

```
{API_URL}/api/platforms/{platformId}/oauth/callback
```

**Example for production:**
```
https://www.momentumaicreator.com/api/platforms/instagram/oauth/callback
https://www.momentumaicreator.com/api/platforms/twitter/oauth/callback
https://www.momentumaicreator.com/api/platforms/youtube/oauth/callback
https://www.momentumaicreator.com/api/platforms/linkedin/oauth/callback
https://www.momentumaicreator.com/api/platforms/facebook/oauth/callback
https://www.momentumaicreator.com/api/platforms/tiktok/oauth/callback
```

**Make sure `API_URL` matches your production domain exactly!**

```
# Encryption and OAuth State Secrets (REQUIRED in production)
# Generate with: openssl rand -hex 32
# These must be the same across all server instances
TOKEN_ENCRYPTION_KEY=your-64-character-hex-encryption-key-here
OAUTH_STATE_SECRET=your-64-character-hex-oauth-state-secret-here

# Instagram Basic Display API
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
# Callback URL: {API_URL}/api/platforms/instagram/oauth/callback
# Configure in: https://developers.facebook.com/apps/

# Twitter/X OAuth 2.0 (uses PKCE automatically)
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
# Callback URL: {API_URL}/api/platforms/twitter/oauth/callback
# Configure in: https://developer.twitter.com/en/portal/dashboard
# Note: Enable OAuth 2.0 and PKCE in Twitter app settings

# Google/YouTube OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
# Callback URL: {API_URL}/api/platforms/youtube/oauth/callback
# Configure in: https://console.cloud.google.com/apis/credentials
# Required scopes: https://www.googleapis.com/auth/youtube.upload, https://www.googleapis.com/auth/youtube

# LinkedIn OAuth 2.0 (uses PKCE automatically)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
# Callback URL: {API_URL}/api/platforms/linkedin/oauth/callback
# Configure in: https://www.linkedin.com/developers/apps
# Required scopes: r_liteprofile, r_emailaddress, w_member_social

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
# Callback URL: {API_URL}/api/platforms/facebook/oauth/callback
# Configure in: https://developers.facebook.com/apps/
# Required scopes: pages_manage_posts, pages_read_engagement

# TikTok OAuth (uses PKCE automatically)
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
# Callback URL: {API_URL}/api/platforms/tiktok/oauth/callback
# Configure in: https://developers.tiktok.com/
# Required scopes: user.info.basic, video.upload
```

**Important Notes:**
- **FRONTEND_URL:** Used for CORS and redirects (Stripe checkout, OAuth callbacks). Must match your production domain exactly.
- **API_URL:** Used for OAuth redirect URIs (Instagram, Twitter, YouTube, etc.)
  - **OAuth Callback URLs must be configured as:** `{API_URL}/api/platforms/{platformId}/oauth/callback`
  - Example: `https://www.momentumaicreator.com/api/platforms/instagram/oauth/callback`
  - **CRITICAL:** Add these exact URLs in each platform's OAuth app settings BEFORE testing
  - If API_URL and FRONTEND_URL are the same domain, set both to your production domain
  - For Vercel deployments, typically: `API_URL=https://www.momentumaicreator.com` and `FRONTEND_URL=https://www.momentumaicreator.com`
- **VITE_API_URL:** If using server AI (`VITE_USE_SERVER_AI=true`), also add:
  ```
  VITE_API_URL=https://www.momentumaicreator.com
  ```
- **TOKEN_ENCRYPTION_KEY and OAUTH_STATE_SECRET:** Required in production. Generate secure random keys:
  ```bash
  openssl rand -hex 32
  ```
  These must be the same across all server instances to decrypt tokens and verify OAuth state.

**⚠️ Use your custom domain (`www.momentumaicreator.com`) not the Vercel URL!**

---

## 📝 Quick Copy-Paste Guide

### In Vercel Dashboard:

1. **Settings** → **Environment Variables**
2. Click **"Add New"**
3. For each variable below, add it:

| Variable Name | Where to Find It |
|--------------|------------------|
| `VITE_FIREBASE_API_KEY` | Your `.env` file |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your `.env` file |
| `VITE_FIREBASE_PROJECT_ID` | Your `.env` file |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your `.env` file |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your `.env` file |
| `VITE_FIREBASE_APP_ID` | Your `.env` file |
| `VITE_FIREBASE_DATABASE_URL` | Your `.env` file |
| `VITE_GOOGLE_GENERATIVE_AI_API_KEY` | Your `.env` file |
| `VITE_APP_URL` | Your `.env` file (optional) |

---

## 🎯 Example: Adding Your First Variable

**Let's say you're adding Firebase API Key:**

1. In Vercel: **Settings** → **Environment Variables**
2. Click **"Add New"**
3. **Key:** `VITE_FIREBASE_API_KEY`
4. **Value:** `AIzaSyC...` (your actual key from `.env`)
5. **Environment:** Check all three boxes (Production, Preview, Development)
6. Click **"Save"**
7. Repeat for all other variables!

---

## ⚠️ Important Notes

### 1. Use Production Keys
- For **Firebase**: Use your production Firebase config
- For **Gemini**: Use your production API key

### 2. Environment Selection
- **Production**: Used for your live site
- **Preview**: Used for preview deployments (pull requests)
- **Development**: Used for local development (if you connect Vercel CLI)

**Recommendation:** Check all three for most variables, or just Production if you only want them on your live site.

### 3. No Quotes Needed
- Don't add quotes around values in Vercel
- If your `.env` has: `VITE_FIREBASE_API_KEY="AIzaSyC..."`
- In Vercel, just use: `AIzaSyC...` (no quotes)

### 4. Redeploy After Adding
- After adding environment variables, you **must redeploy**
- Go to **Deployments** → Click **"..."** → **"Redeploy"**
- Or push a new commit to trigger a new deployment

---

## 🔍 How to Find Your Values

### From Your `.env` File:
1. Open your `.env` file in your project
2. Copy each value (the part after the `=`)
3. Paste into Vercel

### From Firebase Console:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → **Project Settings**
4. Scroll to **"Your apps"** → **Web apps**
5. Copy the config values

### From Google AI Studio:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Your API key is displayed there
3. Copy it

---

## ✅ Verification Checklist

After adding all variables:

- [ ] All Firebase variables added
- [ ] Google Gemini API key added
- [ ] FRONTEND_URL set to production URL
- [ ] API_URL set to production URL (must match OAuth callback URLs)
- [ ] TOKEN_ENCRYPTION_KEY generated and added (required in production)
- [ ] OAUTH_STATE_SECRET generated and added (required in production)
- [ ] All platform OAuth credentials added (Instagram, Twitter, LinkedIn, Facebook, TikTok, Google)
- [ ] OAuth callback URLs configured in each platform's OAuth app settings
- [ ] VITE_API_URL set (if using server AI)
- [ ] All variables set for Production environment
- [ ] Redeployed the application
- [ ] Tested authentication (auth modal opens correctly)
- [ ] Tested AI health check
- [ ] Tested pricing upgrade modal
- [ ] Tested platform integrations (OAuth flows work correctly)
- [ ] Tested all `/api/*` endpoints
- [ ] Verified CSP headers allow your production API domains (see vercel.json)

---

## 🐛 Troubleshooting

### Issue: Variables not working after deployment
**Solution:**
- Make sure you redeployed after adding variables
- Check that variable names match exactly (case-sensitive)
- Verify no extra spaces or quotes in values
- Check Vercel deployment logs for errors

### Issue: "Environment variable not found" error
**Solution:**
- Verify variable name starts with `VITE_`
- Check that variable is added to Production environment
- Make sure you redeployed after adding

### Issue: Firebase not connecting
**Solution:**
- Double-check all Firebase variables are correct
- Verify Firebase project is active
- Check Firebase console for any restrictions
- Make sure `VITE_FIREBASE_DATABASE_URL` includes `https://` and ends with `.firebaseio.com`

### Issue: AI features not working
**Solution:**
- Verify `VITE_GOOGLE_GENERATIVE_AI_API_KEY` is correct
- Check Google Cloud Console for API quota/limits
- Verify API key has proper permissions

---

## 🎉 Quick Reference

**Vercel Environment Variables Location:**
```
Dashboard → Your Project → Settings → Environment Variables
```

**After Adding Variables:**
```
Dashboard → Your Project → Deployments → ... → Redeploy
```

**Your `.env` file structure:**
```bash
VITE_FIREBASE_API_KEY=your_value_here
VITE_FIREBASE_AUTH_DOMAIN=your_value_here
# ... etc
```

**In Vercel, add them exactly as shown above!**

---

## 💡 Pro Tips

1. **Add all at once:** You can add multiple variables, then redeploy once
2. **Use Production keys:** Make sure you're using production/live keys, not test keys
3. **Keep `.env` secure:** Never commit your `.env` file to Git (it's in `.gitignore`)
4. **Test after deployment:** Always test your site after adding environment variables
5. **Document your keys:** Keep a secure backup of your keys (password manager, etc.)

---

**You've got this! Just copy from your `.env` file and paste into Vercel!** 🚀

---

## 🔒 CSP Configuration for Production API Domains

If you're using a custom domain or separate API server, you may need to update the Content Security Policy (CSP) in `vercel.json`.

### Current CSP includes:
- `https://*.vercel.app` (all Vercel domains)
- Firebase domains
- Stripe domains
- Google APIs

### If using a custom domain:
1. Open `momentum-ai/vercel.json`
2. Find the `Content-Security-Policy` header
3. Add your custom domain to `connect-src`:
   ```json
   "connect-src 'self' ... https://your-custom-domain.com ..."
   ```
4. Redeploy after updating

### If using a separate API server:
Add your API server domain to `connect-src` in the CSP header.

**Example:** If your API is at `https://api.example.com`, update the CSP to include it in `connect-src`.

