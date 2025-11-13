# ✅ Vercel Deployment Checklist

Use this checklist to verify your Vercel deployment is configured correctly before deploying.

## 📋 Pre-Deployment Checklist

### 1. Vercel Configuration
- [ ] Single `vercel.json` exists at repository root (not in `momentum-ai/`)
- [ ] Vercel project is linked at repository root level
- [ ] Build command uses pnpm: `cd momentum-ai && pnpm install --frozen-lockfile && pnpm run build`
- [ ] Output directory is `momentum-ai/dist`
- [ ] API rewrite points to `/api/:path*` → `/momentum-ai/api/server.js`
- [ ] API rewrite is listed BEFORE SPA catch-all rewrite
- [ ] Function config has `maxDuration: 60` and `memory: 1536`
- [ ] HTML routes have cache headers: `Cache-Control: no-store` and `Vercel-CDN-Cache-Control: max-age=0, s-maxage=0, stale-while-revalidate=0`

### 2. Environment Variables (Frontend - VITE_*)
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_DATABASE_URL`
- [ ] `VITE_GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] `VITE_APP_URL` (production domain)
- [ ] `VITE_USE_SERVER_AI=true` (if using server AI)
- [ ] `VITE_API_URL` (production domain, if using server AI)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (if using Stripe)

### 3. Environment Variables (Backend)
- [ ] `NODE_ENV=production` (NOT `development`)
- [ ] `FRONTEND_URL` (production domain, no localhost)
- [ ] `API_URL` (production domain, no localhost)
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- [ ] All Stripe price IDs (if using Stripe)
- [ ] `TOKEN_ENCRYPTION_KEY` (64-character hex, required)
- [ ] `OAUTH_STATE_SECRET` (64-character hex, required)
- [ ] Platform OAuth credentials (if using platform integrations)

### 4. CI/CD Configuration
- [ ] `.github/workflows/vercel-deploy.yml` uses pnpm
- [ ] CI workflow installs pnpm with `pnpm/action-setup@v2`
- [ ] CI workflow uses `pnpm install --frozen-lockfile`
- [ ] CI workflow builds with `pnpm build`

### 5. API Configuration
- [ ] `momentum-ai/api/server.js` exists and exports Express app
- [ ] `momentum-ai/api/server.js` requires `../server/server`
- [ ] No conflicting `momentum-ai/vercel.json` file exists
- [ ] API routes are accessible at `/api/*`

### 6. Security Configuration
- [ ] CORS allows only production domains (no localhost in production)
- [ ] `FRONTEND_URL` is set to production domain
- [ ] Security middleware uses `NODE_ENV=production` for CORS
- [ ] No development-only CORS origins in production

## 🧪 Post-Deployment Verification

### 1. Build Verification
- [ ] Build completes successfully
- [ ] No build errors in Vercel logs
- [ ] Frontend assets are generated in `momentum-ai/dist`

### 2. API Verification
- [ ] `/api/health` returns JSON (not HTML)
- [ ] API routes respond correctly
- [ ] No 404 errors on API endpoints
- [ ] Function logs show no errors

### 3. Frontend Verification
- [ ] Homepage loads correctly
- [ ] No console errors
- [ ] Environment variables are accessible (check `import.meta.env`)
- [ ] API calls hit production API (not localhost)
- [ ] Auth modal opens correctly
- [ ] Stripe checkout works (if applicable)

### 4. Cache Verification
- [ ] HTML routes have `Cache-Control: no-store` header
- [ ] HTML routes have `Vercel-CDN-Cache-Control` header
- [ ] Changes to HTML are visible immediately after deploy
- [ ] No stale content served from CDN

### 5. CORS Verification
- [ ] No CORS errors in browser console
- [ ] API requests succeed from frontend
- [ ] CORS headers are present in API responses
- [ ] Only production domains are allowed

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs for errors
- Verify pnpm is installed correctly
- Verify `pnpm-lock.yaml` exists
- Check for syntax errors in `vercel.json`

### API Returns 404
- Verify API rewrite is listed before SPA catch-all
- Verify `momentum-ai/api/server.js` exists
- Check function logs in Vercel dashboard
- Verify API route path matches rewrite pattern

### Environment Variables Not Working
- Verify variables are set in Vercel Dashboard (not just `.env`)
- Verify variables are set for Production environment
- Redeploy after adding variables
- Check function logs to verify variables are loaded

### CORS Errors
- Verify `FRONTEND_URL` is set to production domain
- Verify `NODE_ENV=production` is set
- Check security middleware allows production origins
- Remove localhost entries from production environment

### Stale Content
- Verify cache headers are set on HTML routes
- Purge Vercel CDN cache if needed
- Check `x-vercel-cache` response header shows MISS/REVALIDATED
- Redeploy to clear cache

---

**Last Updated:** After implementing all 11 deployment comments
**Status:** ✅ All deployment issues addressed

