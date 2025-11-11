# 🔐 Setting Up Your .env File

## 📍 Where is the .env file?

The `.env` file should be in the **root of your project** (same folder as `package.json`):

```
momentum-ai/
├── .env              ← Create this file here!
├── .env.example      ← Use this as a template
├── package.json
├── src/
└── ...
```

---

## 🚀 Quick Setup Steps

### Step 1: Create the .env File

**Option A: Using Command Line (Recommended)**
```bash
# In your terminal, from the momentum-ai folder:
copy .env.example .env
```

**Option B: Manually**
1. Open your project folder in a text editor (VS Code, Notepad++, etc.)
2. Find `.env.example` file
3. Copy it
4. Rename the copy to `.env` (remove `.example`)

### Step 2: Fill in Your Values

Open the `.env` file and replace the placeholder values with your actual keys:

---

## 🔑 Where to Get Your Values

### Firebase Configuration

1. **Go to Firebase Console**
   - Visit: [console.firebase.google.com](https://console.firebase.google.com/)
   - Select your project (or create one)

2. **Get Your Config**
   - Click the gear icon ⚙️ → **Project Settings**
   - Scroll down to **"Your apps"** section
   - If you don't have a web app, click **"Add app"** → **Web** (</> icon)
   - Copy the values from the config object

3. **Fill in your .env:**
```bash
VITE_FIREBASE_API_KEY=AIzaSyC...                    # From Firebase config
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

### Google Gemini AI Key

1. **Go to Google AI Studio**
   - Visit: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Or: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. **Create API Key**
   - Click **"Create API Key"**
   - Select your Google Cloud project
   - Copy the key

3. **Fill in your .env:**
```bash
VITE_GEMINI_API_KEY=AIzaSyC...                      # Your Gemini API key
```

### Stripe Publishable Key (If Using Payments)

1. **Go to Stripe Dashboard**
   - Visit: [dashboard.stripe.com](https://dashboard.stripe.com/)
   - Log in

2. **Get Your Key**
   - Go to **Developers** → **API keys**
   - Copy your **Publishable key**
   - For production, use the **LIVE** key (starts with `pk_live_`)
   - For testing, use the **TEST** key (starts with `pk_test_`)

3. **Fill in your .env:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...             # Your Stripe key
```

---

## 📝 Complete .env File Template

Here's what your `.env` file should look like (with your actual values):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC_your_actual_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_key_here

# Gemini API Configuration
VITE_GEMINI_API_KEY=AIzaSyC_your_actual_key_here

# Server AI Configuration (Optional)
VITE_USE_SERVER_AI=false
VITE_API_URL=http://localhost:3001

# Application Configuration
VITE_APP_ENV=development
```

---

## ✅ Verification

After creating your `.env` file:

1. **Check it exists:**
   ```bash
   # In terminal, from momentum-ai folder:
   ls .env
   # Should show: .env
   ```

2. **Verify it's not empty:**
   - Open `.env` file
   - Make sure all values are filled in (not "your_xxx_here")

3. **Test locally:**
   ```bash
   npm run dev
   # Should start without errors
   ```

---

## 🚨 Important Security Notes

1. **Never commit `.env` to Git**
   - It's already in `.gitignore` ✅
   - Never share your `.env` file publicly
   - Never post API keys online

2. **Use Production Keys for Vercel**
   - When adding to Vercel, use your **production/live** keys
   - Not test keys (unless testing)

3. **Keep Backups Securely**
   - Store your keys in a password manager
   - Don't email them or store in plain text files

---

## 🎯 Next Steps

After creating your `.env` file:

1. ✅ Fill in all the values
2. ✅ Test locally (`npm run dev`)
3. ✅ Add the same variables to Vercel (see `VERCEL_ENV_VARIABLES.md`)
4. ✅ Deploy!

---

## 🐛 Troubleshooting

### Issue: ".env file not found"
**Solution:**
- Make sure you're in the `momentum-ai` folder (root of project)
- Create the file: `copy .env.example .env` (Windows) or `cp .env.example .env` (Mac/Linux)

### Issue: "Environment variable not defined"
**Solution:**
- Check that `.env` file exists in root folder
- Verify all values are filled in (no placeholders)
- Restart your dev server after creating `.env`

### Issue: "Firebase not connecting"
**Solution:**
- Double-check all Firebase values are correct
- Make sure `VITE_FIREBASE_DATABASE_URL` includes `https://` and ends with `.firebaseio.com`
- Verify Firebase project is active in Firebase Console

---

## 📍 File Location Summary

```
C:\Users\Jeremy\Desktop\FINAL_MOMENTUMAI\momentum-ai\
├── .env              ← CREATE THIS FILE HERE
├── .env.example      ← Template (already exists)
├── package.json
└── ...
```

**The `.env` file should be in the same folder as `package.json`!**

---

**You've got this! Just copy `.env.example` to `.env` and fill in your values!** 🚀

