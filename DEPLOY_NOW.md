# 🚀 DEPLOY NOW - Quick Fix Guide

## What Was Fixed

✅ **API Route Wrapper** - Fixed CommonJS/ESM import issue  
✅ **Vercel Config** - Increased timeout to 300s, memory to 3GB  
✅ **CORS** - Auto-allows Vercel domains  
✅ **Streaming** - Added proper headers and flush calls  
✅ **Health Check** - Enhanced with diagnostics  

## Immediate Deployment Steps

### 1. Commit & Push
```bash
git add .
git commit -m "Fix Vercel serverless deployment - API routes, streaming, CORS"
git push
```

### 2. Set Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

**CRITICAL - Set these first:**
```
NODE_ENV=production
FRONTEND_URL=https://your-domain.com,https://*.vercel.app
AI_PROVIDER=gemini (or ollama, openai)
GEMINI_API_KEY=your-key (if using Gemini)
```

**Full list in:** `VERCEL_FIXES.md`

### 3. Redeploy
- Vercel auto-deploys on push, OR
- Manual: `vercel --prod`

### 4. Verify
```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Run full verification
node momentum-ai/scripts/verify-vercel-deployment.js https://your-domain.com
```

## Quick Test Commands

```bash
# Health check
curl https://your-domain.com/api/health

# AI models
curl https://your-domain.com/api/ai/models

# Test generation (may require auth)
curl -X POST https://your-domain.com/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}'
```

## If Still Broken

1. **Check Vercel Logs**: Dashboard → Functions → Logs
2. **Verify Env Vars**: All required vars set in Production environment
3. **Test Health Endpoint**: Should return diagnostics
4. **Check CORS**: Verify `FRONTEND_URL` includes your domain

## Common Fixes

| Error | Solution |
|-------|----------|
| "Connection closed" | Check `maxDuration: 300` in vercel.json |
| CORS errors | Set `FRONTEND_URL` with your domain |
| "Module not found" | Verify `includeFiles` in vercel.json |
| Timeout | Increase `maxDuration` to 300 |
| Streaming fails | Check headers include `X-Accel-Buffering: no` |

## Files Changed

- `momentum-ai/api/server.js` - Fixed CommonJS import
- `vercel.json` - Updated runtime config
- `momentum-ai/server/server.js` - Fixed CORS, streaming headers
- `VERCEL_FIXES.md` - Complete documentation

## Next Steps After Deployment

1. ✅ Test all endpoints
2. ✅ Monitor Vercel logs
3. ✅ Set up Vercel Analytics
4. ✅ Configure custom domain (if needed)

**Full details:** See `VERCEL_FIXES.md`

