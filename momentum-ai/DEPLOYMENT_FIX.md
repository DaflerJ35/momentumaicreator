# Deployment Fix - Site Down Issue

## Issue
Site is down - could be DNS issue or serverless function configuration

## Fixes Applied

### 1. Vercel Serverless Function Fix
- Updated `api/index.js` to properly handle Express app export
- Added error handling for server loading
- Fixed environment variable loading

### 2. Server Configuration
- Server.js exports app correctly for Vercel
- Only starts listening when run directly (not when imported)
- Properly handles serverless function context

## Deployment Checklist

### Vercel Deployment
1. **Check Environment Variables**
   - All Firebase env vars set
   - Stripe keys configured
   - API URLs correct
   - Frontend URL set

2. **Verify Build**
   ```bash
   npm run build
   # Check dist folder is created
   ```

3. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors in function logs
   - Check build logs

4. **Verify DNS**
   - Check domain DNS settings
   - Verify A/CNAME records point to Vercel
   - Check SSL certificate status

5. **Test API Endpoints**
   - `/api/health` should return `{status: 'ok'}`
   - Check browser console for CORS errors
   - Verify Firebase connection

## Common Issues

### Issue: Function Timeout
**Solution**: Increase timeout in `vercel.json`
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

### Issue: CORS Errors
**Solution**: Check `FRONTEND_URL` env var matches your domain

### Issue: Firebase Not Working
**Solution**: 
- Verify Firebase env vars are set in Vercel
- Check Firebase project settings
- Verify service account credentials

### Issue: Stripe Webhooks Not Working
**Solution**:
- Check webhook URL in Stripe dashboard
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook endpoint in Vercel logs

## Quick Fixes

### If Site is Completely Down
1. Check Vercel deployment status
2. Rollback to previous deployment if needed
3. Check environment variables
4. Verify build is successful

### If API is Down
1. Check serverless function logs
2. Verify `api/index.js` is correct
3. Check Express app exports correctly
4. Verify all dependencies are installed

### If DNS Issue
1. Check domain DNS records
2. Verify domain is connected to Vercel
3. Check SSL certificate
4. Wait for DNS propagation (up to 48 hours)

## Testing After Fix

1. **Health Check**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Frontend Load**
   - Visit your domain
   - Check browser console for errors
   - Verify authentication works

3. **API Endpoints**
   - Test `/api/health`
   - Test authentication endpoints
   - Test Stripe webhook

## Next Steps

1. Monitor Vercel logs for 24 hours
2. Set up error tracking (Sentry, etc.)
3. Configure alerts for downtime
4. Document deployment process

