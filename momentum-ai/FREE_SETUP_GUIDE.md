# 🆓 Free Setup Guide - Using Ollama Cloud (No Paid APIs Required!)

## 🎯 Goal: Run Momentum AI Creator Completely FREE!

This guide shows you how to set up everything using **free services** only:
- ✅ **Ollama Cloud** - Free AI (instead of paid Gemini)
- ✅ **Firebase Free Tier** - Free authentication & database
- ✅ **No Stripe** - Skip payments for now (optional)

---

## 📋 Step 1: Get Ollama Cloud API Key (FREE!)

### Option A: Ollama Cloud (Recommended - Free Tier Available)

1. **Visit Ollama Cloud**
   - Go to: [cloud.ollama.com](https://cloud.ollama.com) or [ollama.com/cloud](https://ollama.com/cloud)
   - Sign up for a free account

2. **Get Your API Key**
   - Once logged in, go to **API Keys** section
   - Click **"Create API Key"**
   - Copy your API key (looks like: `ollama_xxxxx...`)

3. **Note the API URL**
   - Ollama Cloud API URL: `https://api.ollama.ai`
   - Or check their docs for the latest URL

### Option B: Run Ollama Locally (100% Free, No API Key Needed)

If you want to run Ollama on your own computer:

1. **Install Ollama**
   - Download from: [ollama.com/download](https://ollama.com/download)
   - Install and run it
   - It runs on: `http://localhost:11434` (no API key needed)

2. **Pull a Model**
   ```bash
   ollama pull llama2
   # or
   ollama pull mistral
   ```

---

## 🔥 Step 2: Get Firebase (FREE Tier)

Firebase has a **free tier** that's perfect for getting started:

### 2.1 Create Firebase Project

1. **Go to Firebase Console**
   - Visit: [console.firebase.google.com](https://console.firebase.google.com/)
   - Click **"Add project"** or **"Create a project"**

2. **Project Setup**
   - Enter project name: `momentum-ai-creator` (or whatever you want)
   - Disable Google Analytics (optional, you can enable later)
   - Click **"Create project"**

### 2.2 Enable Authentication

1. **Go to Authentication**
   - In Firebase Console, click **"Authentication"** in left sidebar
   - Click **"Get started"**

2. **Enable Sign-in Methods**
   - Click **"Sign-in method"** tab
   - Enable **"Email/Password"**:
     - Click on "Email/Password"
     - Toggle **"Enable"**
     - Click **"Save"**

3. **Enable Google Sign-in (Optional)**
   - Click on "Google"
     - Toggle **"Enable"**
     - Add your email as project support email
     - Click **"Save"**

### 2.3 Create Realtime Database

1. **Go to Realtime Database**
   - Click **"Realtime Database"** in left sidebar
   - Click **"Create Database"**

2. **Choose Location**
   - Select a location close to you
   - Click **"Next"**

3. **Security Rules**
   - Start in **"Test mode"** (we'll secure it later)
   - Click **"Enable"**

### 2.4 Get Firebase Config

1. **Go to Project Settings**
   - Click the gear icon ⚙️ → **"Project settings"**

2. **Add Web App**
   - Scroll to **"Your apps"** section
   - Click **"Add app"** → Click the **Web** icon `</>`

3. **Register App**
   - App nickname: `Momentum AI Creator`
   - Check **"Also set up Firebase Hosting"** (optional)
   - Click **"Register app"**

4. **Copy Config**
   - You'll see a config object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
   - **Copy these values** - you'll need them for your `.env` file!

5. **Get Database URL**
   - Go back to **"Realtime Database"**
   - You'll see a URL like: `https://your-project-id-default-rtdb.firebaseio.com`
   - **Copy this URL** - this is your `VITE_FIREBASE_DATABASE_URL`

---

## 📝 Step 3: Configure Your .env File

### 3.1 Frontend .env File

Open your `.env` file in the root folder and configure it like this:

```bash
# Firebase Configuration (FREE)
VITE_FIREBASE_API_KEY=AIzaSyC_your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# Ollama Configuration (FREE)
VITE_OLLAMA_API_KEY=ollama_your_key_here
VITE_OLLAMA_BASE_URL=https://api.ollama.ai

# Server AI Configuration (Use Ollama)
VITE_USE_SERVER_AI=true
VITE_API_URL=http://localhost:3001

# Skip Stripe for now (Optional)
# VITE_STRIPE_PUBLISHABLE_KEY=
```

### 3.2 Server .env File

Create a `server/.env` file (copy from `server/.env.example` if it exists):

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Ollama Configuration (FREE)
AI_PROVIDER=ollama
OLLAMA_URL=https://api.ollama.ai
OLLAMA_API_KEY=ollama_your_key_here
AI_DEFAULT_MODEL=llama2

# Skip Stripe for now
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

---

## 🚀 Step 4: Update Server Configuration

The server already supports Ollama! Just make sure:

1. **Server uses Ollama by default**
   - Set `AI_PROVIDER=ollama` in `server/.env`
   - Set `OLLAMA_API_KEY` to your Ollama Cloud key
   - Set `OLLAMA_URL=https://api.ollama.ai`

2. **Frontend uses Server API**
   - Set `VITE_USE_SERVER_AI=true` in `.env`
   - This ensures all AI calls go through your server (where Ollama is configured)

---

## ✅ Step 5: Test Your Setup

### 5.1 Start the Server

```bash
cd server
npm install
npm start
```

### 5.2 Start the Frontend

```bash
# In the root folder
npm run dev
```

### 5.3 Test AI Features

1. Go to your app: `http://localhost:5173`
2. Try using any AI tool (Neural Strategist, etc.)
3. It should work with Ollama Cloud!

---

## 🆓 What's FREE vs What Costs Money

### ✅ FREE (What You're Using):
- **Ollama Cloud** - Free tier available
- **Firebase** - Free tier (Spark plan):
  - 50K reads/day
  - 20K writes/day
  - 1GB storage
  - Authentication (unlimited users)
- **Vercel** - Free hosting
- **GitHub** - Free repository hosting

### 💰 PAID (What You're NOT Using):
- ~~Google Gemini API~~ - Using Ollama instead ✅
- ~~Stripe~~ - Skipping payments for now ✅
- ~~Paid Firebase~~ - Using free tier ✅

---

## 📍 Where to Get Each Value

### Ollama Cloud API Key
1. Go to: [cloud.ollama.com](https://cloud.ollama.com)
2. Sign up / Log in
3. Go to API Keys section
4. Create new key
5. Copy the key

### Firebase Config
1. Go to: [console.firebase.google.com](https://console.firebase.google.com/)
2. Select your project
3. Project Settings → Your apps → Web app
4. Copy all config values
5. Realtime Database → Copy database URL

### Local Ollama (Alternative)
- URL: `http://localhost:11434`
- No API key needed
- Just install and run Ollama locally

---

## 🎯 Quick Setup Checklist

- [ ] Sign up for Ollama Cloud (free)
- [ ] Get Ollama API key
- [ ] Create Firebase project (free)
- [ ] Enable Firebase Authentication
- [ ] Create Firebase Realtime Database
- [ ] Copy Firebase config values
- [ ] Update `.env` file with Firebase values
- [ ] Update `.env` file with Ollama values
- [ ] Create `server/.env` file
- [ ] Set `AI_PROVIDER=ollama` in server/.env
- [ ] Set `VITE_USE_SERVER_AI=true` in .env
- [ ] Test locally
- [ ] Add same variables to Vercel

---

## 🚨 Important Notes

1. **Ollama Cloud Free Tier Limits**
   - Check Ollama Cloud documentation for free tier limits
   - May have rate limits or usage caps
   - Consider running Ollama locally for unlimited free usage

2. **Firebase Free Tier Limits**
   - 50K database reads/day
   - 20K database writes/day
   - 1GB storage
   - This is usually enough for testing and small projects

3. **Local Ollama is 100% Free**
   - If you run Ollama on your own computer
   - No API keys needed
   - No usage limits
   - Just set `OLLAMA_URL=http://localhost:11434`
   - Leave `OLLAMA_API_KEY` empty

---

## 🎉 You're All Set!

With this setup, you're running **completely free**:
- ✅ Ollama Cloud (free AI)
- ✅ Firebase (free tier)
- ✅ Vercel (free hosting)
- ✅ No paid APIs needed!

**Now you can deploy to Vercel and everything will work for free!** 🚀

---

## 📞 Need Help?

- **Ollama Docs**: [ollama.com/docs](https://ollama.com/docs)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Ollama Cloud**: [cloud.ollama.com](https://cloud.ollama.com)

**You've got this! Everything is free!** 🎉

