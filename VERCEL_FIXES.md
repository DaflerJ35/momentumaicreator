# Vercel Deployment Fixes - Complete Guide

## Critical Issues Fixed

### 1. API Route Wrapper (FIXED)
**Problem**: The API wrapper was trying to import CommonJS Express app as ESM, causing module resolution failures.

**Fix**: Updated `momentum-ai/api/server.js` to use `require()` instead of `import` for CommonJS compatibility.

### 2. Vercel Serverless Configuration (FIXED)
**Problem**: 
- `maxDuration: 60` was too short for AI operations
- Memory was insufficient for PyTorch/AI workloads
- No region specified (could cause latency)

**Fix**: Updated `vercel.json`:
```json
{
  "runtime": "nodejs20.x",
  "maxDuration": 300,  // 5 minutes (max for Pro plan)
  "memory": 3008,       // 3GB (max for Pro plan)
  "regions": ["iad1"]  // US East (Virginia)
}
```

### 3. CORS Configuration (FIXED)
**Problem**: CORS was blocking requests from Vercel preview/production URLs.

**Fix**: Updated CORS logic to:
- Automatically allow `*.vercel.app` domains
- Include `VERCEL_URL` environment variable
- Support wildcard patterns for Vercel previews

### 4. Streaming Endpoint (FIXED)
**Problem**: 
- Headers not flushed immediately
- No heartbeat mechanism for Vercel serverless
- Connection could timeout

**Fix**: 
- Added `res.flushHeaders()` immediately after setting headers
- Reduced heartbeat interval to 15 seconds
- Added `res.flush()` calls after each chunk
- Added `X-Accel-Buffering: no` header

## Required Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables**:

### Backend (Serverless Function)
```
NODE_ENV=production
FRONTEND_URL=https://your-domain.com,https://*.vercel.app
AI_PROVIDER=ollama|gemini|openai
GEMINI_API_KEY=your-key (if using Gemini)
OPENAI_API_KEY=your-key (if using OpenAI)
OLLAMA_API_URL=https://your-ollama-instance.com (if using Ollama)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} (JSON string)
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (Build-time)
```
VITE_API_URL=https://your-domain.com (or leave empty for same-origin)
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
VITE_USE_SERVER_AI=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Deployment Steps

1. **Commit and push changes**:
```bash
git add .
git commit -m "Fix Vercel serverless deployment issues"
git push
```

2. **Vercel will auto-deploy** (if connected to Git)

3. **Or deploy manually**:
```bash
vercel --prod
```

## Verification Checklist

After deployment, verify:

- [ ] API endpoints respond: `https://your-domain.com/api/ai/models`
- [ ] Streaming works: Test `/api/ai/stream` endpoint
- [ ] CORS allows requests from your domain
- [ ] No timeout errors in Vercel logs
- [ ] Database connections work (Firebase)
- [ ] AI generation endpoints return content

## Testing Endpoints

### 1. Health Check
```bash
curl https://your-domain.com/api/ai/models
```

### 2. AI Generation (Non-streaming)
```bash
curl -X POST https://your-domain.com/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, world!","temperature":0.7}'
```

### 3. AI Streaming
```bash
curl -X POST https://your-domain.com/api/ai/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Tell me a story","temperature":0.7}' \
  --no-buffer
```

## Common Issues & Solutions

### Issue: "Connection closed" or timeout
**Solution**: 
- Check `maxDuration` in `vercel.json` (should be 300)
- Verify memory allocation (3008 MB)
- Check Vercel logs for specific errors

### Issue: CORS errors
**Solution**:
- Set `FRONTEND_URL` in Vercel env vars
- Include your custom domain
- Include `https://*.vercel.app` pattern

### Issue: "Module not found" errors
**Solution**:
- Verify `includeFiles` in `vercel.json` includes `momentum-ai/server/**`
- Check that all dependencies are in `package.json`
- Ensure build completes successfully

### Issue: Streaming doesn't work
**Solution**:
- Verify `res.flushHeaders()` is called
- Check heartbeat interval (15 seconds)
- Test with `curl --no-buffer` flag
- Check Vercel function logs for errors

### Issue: Environment variables not available
**Solution**:
- Variables must be set in Vercel Dashboard (not `.env` files)
- `VITE_` prefixed vars are build-time only
- Non-`VITE_` vars are runtime only
- Redeploy after adding env vars

## Vercel-Specific Limitations

1. **Streaming**: 
   - Max duration: 300 seconds (Pro plan)
   - Must send data within 10 seconds of request
   - Heartbeat required every 15-20 seconds

2. **Memory**:
   - Max: 3008 MB (Pro plan)
   - PyTorch models may need external hosting

3. **Cold Starts**:
   - First request after inactivity: 2-5 seconds
   - Keep functions warm with cron jobs if needed

4. **File System**:
   - Read-only except `/tmp`
   - Use external storage (Firebase, S3) for persistent files

## Next Steps

1. Deploy to Vercel
2. Test all endpoints
3. Monitor Vercel logs for errors
4. Set up Vercel Analytics for monitoring
5. Configure custom domain if needed

## Support

If issues persist:
1. Check Vercel Function Logs: Dashboard → Your Project → Functions → Logs
2. Check Build Logs: Dashboard → Your Project → Deployments → [Latest] → Build Logs
3. Test locally with `vercel dev` to replicate issues

