# 🚀 Deploy to Vercel - LIVE DEPLOYMENT GUIDE

## Quick Deploy (3 Options)

### Option 1: Deploy via Vercel Dashboard (EASIEST - RECOMMENDED)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Your Repository**
   - Click "Import Project"
   - Select: `DaflerJ35/momentumaicreator`
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./momentum-ai` (if repo has subdirectory)
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all your `VITE_*` variables:
     ```
     VITE_FIREBASE_API_KEY=your_key
     VITE_FIREBASE_AUTH_DOMAIN=your_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_DATABASE_URL=your_database_url
     VITE_STRIPE_PUBLISHABLE_KEY=your_key
     VITE_GEMINI_API_KEY=your_key
     VITE_APP_URL=https://your-vercel-url.vercel.app
     ```

5. **Deploy!**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be LIVE at: `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   # or
   pnpm add -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd C:\Users\Jeremy\Desktop\FINAL_MOMENTUMAI\momentum-ai
   vercel
   ```

4. **Follow Prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_FIREBASE_API_KEY
   vercel env add VITE_FIREBASE_AUTH_DOMAIN
   # ... add all your env vars
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

### Option 3: Auto-Deploy via GitHub (BEST FOR CONTINUOUS DEPLOYMENT)

1. **Connect GitHub to Vercel**
   - Go to https://vercel.com/new
   - Import `DaflerJ35/momentumaicreator`
   - Enable "Deploy on Push"

2. **Every time you push to GitHub, it auto-deploys!**

---

## 🎯 After Deployment

### Your Live URL will be:
```
https://your-project-name.vercel.app
```

### Custom Domain (Optional):
1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records
4. Done!

---

## 🔧 Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check `vercel.json` configuration

### App Not Loading?
- Check browser console for errors
- Verify Firebase config is correct
- Check environment variables match

### Need to Update?
- Just push to GitHub (if auto-deploy enabled)
- Or run: `vercel --prod`

---

## 📝 Notes

- **Free Tier**: 100GB bandwidth/month, perfect for starting
- **Auto-Deploy**: Every push to main branch = new deployment
- **Preview Deploys**: Every PR gets its own preview URL
- **Environment Variables**: Set once, use everywhere

---

## ✅ You're LIVE!

Your app is now accessible worldwide at your Vercel URL! 🚀


