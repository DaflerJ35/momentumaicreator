# 🔍 Where to Get All Your .env File Values (FREE Setup)

## 🎯 Quick Answer: Everything is FREE!

You only need **2 things** for free setup:
1. **Ollama Cloud API Key** (FREE) - For AI
2. **Firebase Config** (FREE) - For authentication & database

---

## 📍 Location 1: Ollama Cloud API Key (FREE AI)

### Where to Get It:
1. **Visit**: [ollama.com](https://ollama.com) or [cloud.ollama.com](https://cloud.ollama.com)
2. **Sign up** for a free account
3. **Go to**: Your dashboard → API Keys section
4. **Click**: "Create API Key" or "Generate Key"
5. **Copy** the key (looks like: `ollama_xxxxx...`)

### What to Add to .env:
```bash
VITE_OLLAMA_API_KEY=ollama_your_key_here
VITE_OLLAMA_BASE_URL=https://api.ollama.ai
```

### Alternative: Run Ollama Locally (100% Free, No API Key)
- **Download**: [ollama.com/download](https://ollama.com/download)
- **Install** and run it
- **No API key needed!** Just use: `http://localhost:11434`

---

## 📍 Location 2: Firebase Config (FREE Authentication & Database)

### Where to Get It:

#### Step 1: Create Firebase Project
1. **Visit**: [console.firebase.google.com](https://console.firebase.google.com/)
2. **Click**: "Add project" or "Create a project"
3. **Enter**: Project name (e.g., "momentum-ai-creator")
4. **Click**: "Create project"

#### Step 2: Enable Authentication
1. **Click**: "Authentication" in left sidebar
2. **Click**: "Get started"
3. **Click**: "Sign-in method" tab
4. **Enable**: "Email/Password"
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

#### Step 3: Create Database
1. **Click**: "Realtime Database" in left sidebar
2. **Click**: "Create Database"
3. **Select**: Location (choose closest to you)
4. **Security**: Start in "Test mode"
5. **Click**: "Enable"

#### Step 4: Get Your Config Values
1. **Click**: Gear icon ⚙️ → "Project settings"
2. **Scroll** to "Your apps" section
3. **Click**: "Add app" → Web icon `</>`
4. **Enter**: App nickname (e.g., "Momentum AI Creator")
5. **Click**: "Register app"
6. **Copy** these values from the config:

```javascript
// You'll see something like this:
const firebaseConfig = {
  apiKey: "AIzaSyC...",                    // ← Copy this
  authDomain: "your-project.firebaseapp.com",  // ← Copy this
  projectId: "your-project-id",            // ← Copy this
  storageBucket: "your-project.appspot.com",   // ← Copy this
  messagingSenderId: "123456789",          // ← Copy this
  appId: "1:123456789:web:abc123"          // ← Copy this
};
```

#### Step 5: Get Database URL
1. **Go back** to "Realtime Database"
2. **You'll see** a URL like: `https://your-project-id-default-rtdb.firebaseio.com`
3. **Copy** this URL

### What to Add to .env:
```bash
VITE_FIREBASE_API_KEY=AIzaSyC_your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

---

## 📝 Complete .env File (FREE Setup)

Here's your complete `.env` file for FREE setup:

```bash
# ============================================
# FREE SETUP - Using Ollama Cloud & Firebase
# ============================================

# Firebase Configuration (FREE - From Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyC_your_key_from_firebase
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

# Ollama Cloud Configuration (FREE - From Ollama Cloud)
VITE_OLLAMA_API_KEY=ollama_your_key_here
VITE_OLLAMA_BASE_URL=https://api.ollama.ai

# Server AI Configuration (Use Ollama)
VITE_USE_SERVER_AI=true
VITE_API_URL=http://localhost:3001

# Skip Stripe (Not needed for free setup)
# VITE_STRIPE_PUBLISHABLE_KEY=

# Application Configuration
VITE_APP_ENV=development
```

---

## 🖥️ Server .env File (server/.env)

Create this file in the `server/` folder:

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

# Skip Stripe (Not needed for free setup)
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
```

---

## ✅ Quick Checklist

### For Ollama:
- [ ] Go to [ollama.com](https://ollama.com)
- [ ] Sign up for free account
- [ ] Get API key from dashboard
- [ ] OR run Ollama locally (no API key needed)

### For Firebase:
- [ ] Go to [console.firebase.google.com](https://console.firebase.google.com/)
- [ ] Create new project
- [ ] Enable Authentication (Email/Password)
- [ ] Create Realtime Database
- [ ] Add Web app
- [ ] Copy all config values
- [ ] Copy database URL

### For Your .env File:
- [ ] Open `.env` file in root folder
- [ ] Add all Firebase values
- [ ] Add Ollama API key
- [ ] Set `VITE_USE_SERVER_AI=true`
- [ ] Save file

### For Server:
- [ ] Create `server/.env` file
- [ ] Set `AI_PROVIDER=ollama`
- [ ] Add Ollama API key
- [ ] Save file

---

## 🎯 Summary: Where to Go

| What You Need | Where to Get It | Cost |
|--------------|----------------|------|
| **Ollama API Key** | [ollama.com](https://ollama.com) or [cloud.ollama.com](https://cloud.ollama.com) | 🆓 FREE |
| **Firebase Config** | [console.firebase.google.com](https://console.firebase.google.com/) | 🆓 FREE |
| **Stripe Key** | Skip it! (Not needed for free setup) | ❌ Skip |

---

## 🚀 Next Steps

1. ✅ Get Ollama API key (or run locally)
2. ✅ Get Firebase config
3. ✅ Fill in your `.env` file
4. ✅ Create `server/.env` file
5. ✅ Test locally: `npm run dev`
6. ✅ Add same variables to Vercel
7. ✅ Deploy!

---

## 💡 Pro Tips

1. **Ollama Local is 100% Free**
   - No API key needed
   - No usage limits
   - Just install and run: `ollama serve`
   - Use URL: `http://localhost:11434`

2. **Firebase Free Tier is Generous**
   - 50K reads/day
   - 20K writes/day
   - 1GB storage
   - Perfect for getting started!

3. **Skip Payments for Now**
   - You can add Stripe later
   - Focus on getting the app working first
   - Add payments when you're ready to monetize

---

**That's it! Everything is FREE!** 🎉

**You only need:**
1. Ollama Cloud account (free)
2. Firebase account (free)
3. Fill in your .env files
4. Deploy!

**You've got this!** 🚀

