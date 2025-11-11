# 🎨 Image, Video & Voice Providers - FREE Setup Guide

## 🎯 Quick Answer: These Are OPTIONAL!

The image, video, and voice providers are for **multimedia generation features**:
- **Image Studio** - Generate AI images
- **Video Studio** - Generate AI videos  
- **Voice Studio** - Generate AI voiceovers

**Good News:** These are **OPTIONAL**! Your main AI features (Neural Strategist, content generation, etc.) **don't need these**!

---

## 📋 What Are These Providers?

### Image Provider (`IMAGE_PROVIDER` / `VITE_IMAGE_PROVIDER`)
- **Purpose:** Generate AI images from text prompts
- **Used in:** Image Studio tool
- **Options:**
  - `dalle3` - OpenAI DALL-E 3 (PAID)
  - `stability` - Stability AI (PAID)

### Video Provider (`VIDEO_PROVIDER` / `VITE_VIDEO_PROVIDER`)
- **Purpose:** Generate AI videos from text prompts
- **Used in:** Video Studio tool
- **Options:**
  - `runway` - RunwayML (PAID)
  - `pika` - Pika Art (PAID)
  - `minimax` - MiniMax (PAID)

### Voice Provider (`VOICE_PROVIDER` / `VITE_VOICE_PROVIDER`)
- **Purpose:** Generate AI voiceovers from text
- **Used in:** Voice Studio tool
- **Options:**
  - `elevenlabs` - ElevenLabs (PAID)
  - `google` - Google Text-to-Speech (FREE TIER AVAILABLE! ✅)
  - `openai` - OpenAI TTS (PAID)

---

## 🆓 FREE Setup Options

### Option 1: Skip Multimedia Features (Simplest)

**Just leave them empty or disabled:**

```bash
# In your .env file (frontend)
# Leave these empty or don't set them
# VITE_IMAGE_PROVIDER=
# VITE_VIDEO_PROVIDER=
# VITE_VOICE_PROVIDER=

# In server/.env file (backend)
# Leave these empty or set to disabled
IMAGE_PROVIDER=
VIDEO_PROVIDER=
VOICE_PROVIDER=
```

**What happens:**
- Image Studio, Video Studio, Voice Studio won't work
- **But all your other AI features will work perfectly!**
- Neural Strategist, content generation, etc. don't need these

### Option 2: Use Free Google TTS for Voice (Recommended)

**Use Google Text-to-Speech (has free tier):**

```bash
# In server/.env file
VOICE_PROVIDER=google
GOOGLE_TTS_API_KEY=your_google_cloud_api_key
```

**How to get Google TTS API Key (FREE):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (free)
3. Enable "Cloud Text-to-Speech API"
4. Create credentials (API key)
5. Free tier: **4 million characters per month FREE!**

### Option 3: Skip for Now, Add Later

**Just don't configure them:**
- Leave provider settings empty
- Your app will work fine
- Add multimedia features later when you're ready

---

## 📝 What to Set in Your .env Files

### For FREE Setup (Skip Multimedia):

**Frontend `.env` file:**
```bash
# Leave these empty or don't set them
# VITE_IMAGE_PROVIDER=
# VITE_VIDEO_PROVIDER=
# VITE_VOICE_PROVIDER=
```

**Server `server/.env` file:**
```bash
# Leave these empty
IMAGE_PROVIDER=
VIDEO_PROVIDER=
VOICE_PROVIDER=

# Don't set API keys for paid services
# OPENAI_API_KEY=
# STABILITY_API_KEY=
# RUNWAY_API_KEY=
# ELEVENLABS_API_KEY=
```

### For FREE Setup (With Google TTS):

**Server `server/.env` file:**
```bash
# Use Google TTS (free tier available)
VOICE_PROVIDER=google
GOOGLE_TTS_API_KEY=your_google_cloud_api_key

# Leave image and video empty
IMAGE_PROVIDER=
VIDEO_PROVIDER=
```

---

## ✅ What Features Still Work Without These?

**Everything except multimedia generation:**

✅ **Neural Strategist** - AI strategy generation  
✅ **Neural Multiplier** - Content transformation  
✅ **Trend Analyzer** - Trend analysis  
✅ **Hashtag Generator** - Hashtag generation  
✅ **Content Calendar** - Content planning  
✅ **Idea Generator** - Content ideas  
✅ **Creator Hub** - AI writing assistant  
✅ **All text-based AI features**  

❌ **Image Studio** - Won't work (needs image provider)  
❌ **Video Studio** - Won't work (needs video provider)  
❌ **Voice Studio** - Won't work (needs voice provider)  

---

## 🎯 Recommended FREE Setup

### For Your .env File (Frontend):
```bash
# Skip multimedia providers
# VITE_IMAGE_PROVIDER=
# VITE_VIDEO_PROVIDER=
# VITE_VOICE_PROVIDER=
```

### For server/.env File (Backend):
```bash
# Skip multimedia providers (or use Google TTS for voice)
IMAGE_PROVIDER=
VIDEO_PROVIDER=
VOICE_PROVIDER=google  # Optional: Use Google TTS (free tier)

# Only set if using Google TTS
# GOOGLE_TTS_API_KEY=your_key_here
```

---

## 💡 How to Get Google TTS API Key (FREE)

### Step 1: Google Cloud Console
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **"Cloud Text-to-Speech API"**:
   - Go to "APIs & Services" → "Library"
   - Search for "Cloud Text-to-Speech API"
   - Click "Enable"

### Step 2: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key

### Step 3: Set in server/.env
```bash
VOICE_PROVIDER=google
GOOGLE_TTS_API_KEY=AIzaSyC_your_key_here
```

### Step 4: Free Tier Limits
- **4 million characters per month FREE!**
- More than enough for testing and small projects

---

## 🚨 Important Notes

### 1. These Are Optional
- **You don't need these for your main AI features!**
- Neural Strategist, content generation, etc. work without them
- Only Image/Video/Voice Studio need these

### 2. Paid Services
- DALL-E 3, Runway, ElevenLabs are all **paid services**
- They require API keys and credit cards
- **Skip them for free setup!**

### 3. Free Alternatives
- **Google TTS** - Free tier (4M characters/month)
- **Stability AI** - Sometimes has free credits
- **Or just skip multimedia features entirely**

### 4. Add Later
- You can always add these later
- Focus on getting your main app working first
- Add multimedia when you're ready to monetize

---

## ✅ Quick Checklist

### For FREE Setup:
- [ ] Leave `IMAGE_PROVIDER` empty in server/.env
- [ ] Leave `VIDEO_PROVIDER` empty in server/.env
- [ ] Leave `VOICE_PROVIDER` empty (or set to `google` for free TTS)
- [ ] Don't set any paid API keys (OPENAI, RUNWAY, ELEVENLABS, etc.)
- [ ] Test your main AI features (they should work!)
- [ ] Skip Image/Video/Voice Studio for now

### Optional: Add Google TTS (FREE):
- [ ] Go to Google Cloud Console
- [ ] Enable Cloud Text-to-Speech API
- [ ] Create API key
- [ ] Set `VOICE_PROVIDER=google` in server/.env
- [ ] Set `GOOGLE_TTS_API_KEY=your_key` in server/.env
- [ ] Voice Studio will work!

---

## 🎯 Summary

**For FREE setup:**
- ✅ **Skip image and video providers** (leave empty)
- ✅ **Skip voice provider** (leave empty) OR use Google TTS (free)
- ✅ **Your main AI features will work perfectly!**
- ✅ **Add multimedia features later when ready**

**These providers are ONLY for:**
- Image Studio (AI image generation)
- Video Studio (AI video generation)
- Voice Studio (AI voiceover generation)

**They are NOT needed for:**
- Neural Strategist
- Content generation
- Trend analysis
- Hashtag generation
- Any text-based AI features

---

## 📝 Your Complete FREE .env Setup

### Frontend `.env`:
```bash
# Firebase (FREE)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=...

# Ollama (FREE)
VITE_OLLAMA_API_KEY=...
VITE_OLLAMA_BASE_URL=https://api.ollama.ai

# Server
VITE_USE_SERVER_AI=true
VITE_API_URL=http://localhost:3001

# Skip multimedia (optional)
# VITE_IMAGE_PROVIDER=
# VITE_VIDEO_PROVIDER=
# VITE_VOICE_PROVIDER=
```

### Server `server/.env`:
```bash
# Server config
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Ollama (FREE)
AI_PROVIDER=ollama
OLLAMA_URL=https://api.ollama.ai
OLLAMA_API_KEY=...
AI_DEFAULT_MODEL=llama2

# Skip multimedia (or use Google TTS)
IMAGE_PROVIDER=
VIDEO_PROVIDER=
VOICE_PROVIDER=  # Leave empty, or set to 'google' for free TTS

# Optional: Google TTS (FREE)
# GOOGLE_TTS_API_KEY=...
```

---

**That's it! Skip the multimedia providers for now - your app will work great without them!** 🚀

**You can always add them later when you're ready!** 🎉

