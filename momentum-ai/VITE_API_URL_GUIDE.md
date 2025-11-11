# 🔗 VITE_API_URL - What to Set and Why

## 🎯 Quick Answer

### For Local Development:
```bash
VITE_API_URL=http://localhost:3001
```

### For Vercel Production:
**Option 1: If you deploy the server to Vercel (Recommended)**
```bash
VITE_API_URL=https://your-project.vercel.app
```
(Use your main Vercel deployment URL)

**Option 2: If you deploy server separately**
```bash
VITE_API_URL=https://your-server-domain.com
```
(Use your server's actual URL)

**Option 3: Skip Server (Simpler, but less secure)**
```bash
VITE_USE_SERVER_AI=false
VITE_API_URL=http://localhost:3001
```
(Only use Ollama directly from frontend - exposes API key)

---

## 📍 What is VITE_API_URL?

`VITE_API_URL` points to your **backend server** where:
- AI requests are processed (Ollama calls)
- API keys are stored securely (server-side)
- All AI operations happen

---

## 🚀 Recommended Setup for Vercel

### Option 1: Deploy Server to Vercel (Best)

Since you're using Vercel, you can deploy your server as **Vercel Serverless Functions**:

1. **Vercel automatically detects server functions**
   - Your `server/` folder can be deployed as serverless functions
   - Vercel will create API routes automatically

2. **Set VITE_API_URL to your Vercel domain:**
   ```bash
   VITE_API_URL=https://your-project.vercel.app
   ```
   (Replace with your actual Vercel deployment URL)

3. **Add server environment variables to Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add server variables:
     - `AI_PROVIDER=ollama`
     - `OLLAMA_URL=https://api.ollama.ai`
     - `OLLAMA_API_KEY=your_ollama_key`
     - `AI_DEFAULT_MODEL=llama2`

### Option 2: Deploy Server Separately (Alternative)

If you deploy the server separately (Railway, Render, etc.):

1. **Deploy your server** to a service like:
   - Railway: [railway.app](https://railway.app)
   - Render: [render.com](https://render.com)
   - Fly.io: [fly.io](https://fly.io)

2. **Get your server URL:**
   - Example: `https://your-server.railway.app`
   - Or: `https://your-server.onrender.com`

3. **Set VITE_API_URL:**
   ```bash
   VITE_API_URL=https://your-server.railway.app
   ```

### Option 3: Skip Server (Simplest, but Less Secure)

If you want to keep it simple and call Ollama directly from the frontend:

1. **Don't use the server:**
   ```bash
   VITE_USE_SERVER_AI=false
   VITE_OLLAMA_API_KEY=your_ollama_key
   VITE_OLLAMA_BASE_URL=https://api.ollama.ai
   ```

2. **Set VITE_API_URL to anything (won't be used):**
   ```bash
   VITE_API_URL=http://localhost:3001
   ```

**⚠️ Warning:** This exposes your Ollama API key in the frontend code (less secure)

---

## 📝 What to Set in Your .env File

### For Local Development:
```bash
VITE_API_URL=http://localhost:3001
VITE_USE_SERVER_AI=true
```

### For Vercel Production:
```bash
VITE_API_URL=https://your-project.vercel.app
VITE_USE_SERVER_AI=true
```

---

## 🎯 Step-by-Step: Setting Up for Vercel

### Step 1: Deploy Frontend to Vercel
1. Connect your GitHub repo to Vercel
2. Deploy (this deploys your frontend)
3. Get your deployment URL: `https://your-project.vercel.app`

### Step 2: Configure Server for Vercel
1. **Check if Vercel detects your server:**
   - Vercel should automatically detect API routes in `server/` folder
   - Or you might need to configure `vercel.json`

2. **Add Server Environment Variables to Vercel:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add:
     ```
     AI_PROVIDER=ollama
     OLLAMA_URL=https://api.ollama.ai
     OLLAMA_API_KEY=your_ollama_key_here
     AI_DEFAULT_MODEL=llama2
     ```

### Step 3: Set VITE_API_URL
1. **In your `.env` file** (for local):
   ```bash
   VITE_API_URL=http://localhost:3001
   ```

2. **In Vercel Environment Variables** (for production):
   ```
   VITE_API_URL=https://your-project.vercel.app
   ```
   (Use your actual Vercel deployment URL)

### Step 4: Test
1. Test locally: `npm run dev`
2. Deploy to Vercel
3. Test production: Visit your Vercel URL

---

## 🔍 How to Find Your Vercel URL

After deploying to Vercel:

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Look at the "Domains" section**
4. **You'll see:** `https://your-project.vercel.app`
5. **This is your VITE_API_URL!**

Or after deployment:
- Vercel shows you the deployment URL
- Copy it and use it as your `VITE_API_URL`

---

## 🚨 Important Notes

### 1. Server Must Be Running
- If `VITE_USE_SERVER_AI=true`, your server MUST be running
- Either deploy it to Vercel as serverless functions
- Or deploy it separately and point to that URL

### 2. CORS Configuration
- Make sure your server allows requests from your Vercel domain
- In `server/server.js`, check CORS settings:
  ```javascript
  FRONTEND_URL=https://your-project.vercel.app
  ```

### 3. Environment Variables
- **Frontend variables** (VITE_*) go in Vercel Environment Variables
- **Server variables** (no VITE_ prefix) also go in Vercel Environment Variables
- Vercel will use the right ones for frontend vs server

---

## ✅ Quick Checklist

### For Local Development:
- [ ] Set `VITE_API_URL=http://localhost:3001` in `.env`
- [ ] Set `VITE_USE_SERVER_AI=true` in `.env`
- [ ] Start server: `cd server && npm start`
- [ ] Start frontend: `npm run dev`

### For Vercel Production:
- [ ] Deploy frontend to Vercel
- [ ] Get your Vercel URL: `https://your-project.vercel.app`
- [ ] Set `VITE_API_URL=https://your-project.vercel.app` in Vercel Environment Variables
- [ ] Set `VITE_USE_SERVER_AI=true` in Vercel Environment Variables
- [ ] Add server environment variables to Vercel:
  - [ ] `AI_PROVIDER=ollama`
  - [ ] `OLLAMA_URL=https://api.ollama.ai`
  - [ ] `OLLAMA_API_KEY=your_key`
  - [ ] `AI_DEFAULT_MODEL=llama2`
- [ ] Redeploy to apply changes

---

## 💡 Recommended Setup

**For your setup (Ollama Cloud + Vercel):**

```bash
# In your .env file (local)
VITE_API_URL=http://localhost:3001
VITE_USE_SERVER_AI=true

# In Vercel Environment Variables (production)
VITE_API_URL=https://your-project.vercel.app
VITE_USE_SERVER_AI=true

# Server variables in Vercel
AI_PROVIDER=ollama
OLLAMA_URL=https://api.ollama.ai
OLLAMA_API_KEY=your_ollama_key
AI_DEFAULT_MODEL=llama2
```

---

## 🎯 Summary

**VITE_API_URL tells your frontend where to find your backend server.**

- **Local:** `http://localhost:3001` (your local server)
- **Production:** `https://your-project.vercel.app` (your Vercel deployment)

**After you deploy to Vercel, use your Vercel URL as the VITE_API_URL!**

---

**You've got this!** 🚀

After you deploy to Vercel, just use that URL as your `VITE_API_URL`!

