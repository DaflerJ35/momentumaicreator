# 🚀 Vercel Quick Start Guide

**Don't panic.** This guide simplifies everything down to the absolute minimum you need to get your app running on Vercel.

## 1. Environment Variables (The Only Ones You Need)

Go to your Vercel Project -> **Settings** -> **Environment Variables** and add these.

### Critical (App Won't Start Without These)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Your Stripe Secret Key |
| `FIREBASE_SERVICE_ACCOUNT` | `{ ... }` | The **entire JSON content** of your service account file. Paste the whole thing. |

### Important (For Features to Work)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `FRONTEND_URL` | `https://your-project.vercel.app` | The URL Vercel gives you. |
| `AI_PROVIDER` | `ollama` | Keeps the app from crashing if you don't have paid AI keys. |

### Optional (Ignore for now if you just want it to load)
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 2. Deployment

1.  **Push to GitHub**: Just push your code.
2.  **Vercel Builds**: Vercel will automatically pick it up.
3.  **Check Logs**: If it fails, look at the "Build Logs" in Vercel.

## 3. Troubleshooting "Duplicate Projects"

If you have two Vercel projects for the same repo:
1.  Pick **ONE** to keep.
2.  Delete the other one (Settings -> Advanced -> Delete Project).
3.  Focus on the one that remains.

**That's it.** You don't need to configure every single platform right now. Get the core running first.
