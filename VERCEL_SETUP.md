# Vercel Deployment Guide

## Overview

This guide covers deploying the Momentum AI full-stack application to Vercel.

## Prerequisites

1. **Vercel Account**: [Sign up at vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm i -g vercel
   vercel login
   ```

3. **Project Structure**:
   ```
   momentum-ai/
   ├── src/              # React frontend
   ├── server/           # Node.js backend
   ├── package.json      # Frontend dependencies
   ├── vercel.json       # Vercel configuration
   └── api/              # Vercel API routes
   ```

## Quick Deploy

### Option 1: Using the Deploy Script

```bash
# Make script executable (Windows)
# On Unix/Mac: chmod +x deploy-vercel.sh

# Run deployment
./deploy-vercel.sh
```

### Option 2: Manual Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

## Environment Variables

### Frontend Variables (in `.env`)

```bash
# Server AI Configuration
VITE_USE_SERVER_AI=true
VITE_API_URL=https://your-app.vercel.app

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# Firebase Configuration (if used)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Backend Variables (Vercel Dashboard)

Go to your Vercel project dashboard → Settings → Environment Variables:

#### Required Variables

```bash
# Environment
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# AI Configuration
AI_PROVIDER=ollama
OLLAMA_URL=https://api.ollama.ai
OLLAMA_API_KEY=your_ollama_api_key_here
AI_DEFAULT_MODEL=llama2

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security Keys (Generate new ones!)
TOKEN_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
OAUTH_STATE_SECRET=abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789

# Stripe Price IDs
STRIPE_MONTHLY_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_MONTHLY_BUSINESS_PRICE_ID=price_your_business_price_id
STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID=price_your_business_plus_price_id
STRIPE_6MONTH_PRO_PRICE_ID=price_your_6month_pro_price_id
STRIPE_6MONTH_BUSINESS_PRICE_ID=price_your_6month_business_price_id
STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID=price_your_6month_business_plus_price_id
STRIPE_YEARLY_PRO_PRICE_ID=price_your_yearly_pro_price_id
STRIPE_YEARLY_BUSINESS_PRICE_ID=price_your_yearly_business_price_id
STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID=price_your_yearly_business_plus_price_id
```

#### Generate Secure Keys

```bash
# Generate TOKEN_ENCRYPTION_KEY (64 characters)
openssl rand -hex 32

# Generate OAUTH_STATE_SECRET (64 characters)
openssl rand -hex 32
```

## Vercel Configuration

**⚠️ IMPORTANT: Single Vercel Configuration**

This project uses a **single `vercel.json` at the repository root**. The Vercel project should be linked at the repository root level.

The root `vercel.json` file handles:

- **Frontend Build**: Vite build to `momentum-ai/dist/` directory using pnpm
- **API Routes**: Serverless functions for `/api/*` routes via `momentum-ai/api/server.js`
- **Routing**: API routes first, then SPA routing with fallback to `index.html`
- **Functions**: Node.js runtime with 60s timeout and 1536MB memory
- **Cache Headers**: HTML routes have no-cache headers to prevent stale content

### File Structure for Vercel

```
FINAL_MOMENTUMAI/           # Repository root
├── vercel.json              # Vercel configuration (ACTIVE)
├── momentum-ai/
│   ├── package.json         # Frontend build scripts (uses pnpm)
│   ├── api/
│   │   └── server.js        # API route wrapper (exports Express app)
│   ├── server/
│   │   ├── server.js        # Express app
│   │   └── package.json     # Server dependencies
│   └── src/                 # React frontend
└── .github/
    └── workflows/
        └── vercel-deploy.yml # CI/CD workflow (uses pnpm)
```

### Build Configuration

- **Build Command**: `cd momentum-ai && pnpm install --frozen-lockfile && pnpm run build`
- **Output Directory**: `momentum-ai/dist`
- **Package Manager**: pnpm (version 10.15.1)
- **API Handler**: `momentum-ai/api/server.js` (single entry point)

## Post-Deployment Setup

### 1. Update Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Update webhook URL to: `https://your-app.vercel.app/api/webhook`
4. Copy the new webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 2. Configure CORS

Update `FRONTEND_URL` in Vercel environment variables:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 3. Enable PWA (Optional)

Set this environment variable to enable PWA features:
```
VITE_ENABLE_PWA=true
```

You'll also need to add PWA icons:
- `public/pwa-192x192.png` (192x192px)
- `public/pwa-512x512.png` (512x512px)

### 4. Custom Domain (Optional)

1. Go to Vercel project dashboard
2. **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build Failures

**Issue**: "Cannot find module" errors
**Solution**: Ensure all dependencies are in the correct `package.json` files

**Issue**: Build timeout
**Solution**: Check for large dependencies or optimize build

### API Issues

**Issue**: API routes return 404
**Solution**: Check that `api/server.js` exports the Express app correctly

**Issue**: CORS errors
**Solution**: Verify `FRONTEND_URL` matches your Vercel domain

### Environment Variables

**Issue**: Variables not working
**Solution**:
1. Check variable names (no `VITE_` prefix for backend)
2. Redeploy after adding new variables
3. Use Vercel's dashboard, not `.env` files for production
4. Verify `NODE_ENV=production` is set (not `development`)
5. Verify `FRONTEND_URL` and `API_URL` point to production domains (no localhost)
6. Verify `VITE_USE_SERVER_AI=true` if using server AI
7. Verify `VITE_API_URL` is set to production domain if using server AI

## Monitoring & Logs

### View Logs

```bash
# View function logs
vercel logs

# View build logs
vercel logs --follow
```

### Analytics

Vercel provides built-in analytics. Check your dashboard for:
- Request counts
- Response times
- Error rates
- Function usage

## Security Notes

1. **Never commit real API keys** to the repository
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** (especially Stripe keys)
4. **Enable Vercel security features**:
   - DDoS protection
   - SSL certificates
   - Security headers

## Performance Optimization

Vercel automatically provides:
- Global CDN
- Edge functions
- Automatic scaling
- Caching headers

Additional optimizations:
- Enable PWA for offline support
- Use Vercel's image optimization
- Configure proper caching headers

## Support

For Vercel-specific issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/discord)
- [GitHub Issues](https://github.com/vercel/vercel/issues)

For Momentum AI issues:
- Check the implementation logs
- Verify environment variable configuration
- Test API endpoints individually
