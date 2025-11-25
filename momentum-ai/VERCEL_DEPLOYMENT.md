# 🚀 Vercel Deployment Guide for Momentum AI

## Quick Deploy Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select GitHub and authorize
   - Select `DaflerJ35/momentumaicreator`

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (repo root, which uses the main `momentum-ai` app)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

   > Note: The separate `Momentum_AI_LandingPage` folder is a standalone marketing site.  
   > If you deploy it, use a **second** Vercel project and a different domain/subdomain (for example, `promo.yourdomain.com`). The primary app domain (with Neo/Flowith integration and `/dashboard`) should point at the project that uses this root `vercel.json` and the `momentum-ai` app.

3. **Environment Variables to Add**

   ### Frontend Variables
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   VITE_APP_URL=https://www.momentumaicreator.com
   ```
   
   **Note:** Use your custom domain `www.momentumaicreator.com` instead of the Vercel URL

   ### Backend/Server Variables
   ```
   NODE_ENV=production
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
   STRIPE_MONTHLY_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_MONTHLY_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_6MONTH_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_6MONTH_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_YEARLY_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_YEARLY_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
   FRONTEND_URL=https://www.momentumaicreator.com
   API_URL=https://www.momentumaicreator.com
   ```
   
   **⚠️ Important:** 
   - Use your custom domain `www.momentumaicreator.com` for `FRONTEND_URL` and `API_URL`
   - `FRONTEND_URL` is used for CORS and Stripe redirects
   - `API_URL` is used for OAuth redirect URIs (Instagram, Twitter, YouTube, etc.)

4. **API Routes Setup**
   - Vercel will automatically detect the `server/` directory
   - API routes will be available at `/api/*`
   - Serverless functions will handle backend requests

5. **Stripe Webhook Configuration**
   - In Stripe Dashboard → Webhooks
   - Add endpoint: `https://www.momentumaicreator.com/api/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`
   
   **Note:** Use your custom domain `www.momentumaicreator.com` for the webhook URL

## Important Notes

- ✅ The `vercel.json` is already configured
- ✅ CSP headers are set for security
- ✅ API routes are configured for serverless functions
- ⚠️ Make sure all environment variables are set before deploying (see VERCEL_ENV_VARIABLES.md)
- ⚠️ Update `FRONTEND_URL` after first deployment
- ⚠️ If using a custom domain or separate API server, update CSP `connect-src` in `vercel.json`
- ⚠️ If using server AI (`VITE_USE_SERVER_AI=true`), set `VITE_API_URL` to your Vercel domain

## Post-Deployment Checklist

- [ ] All environment variables set in Vercel (see VERCEL_ENV_VARIABLES.md)
- [ ] Test authentication (Firebase) - verify auth modal opens with `?showAuth=1` query param
- [ ] Test AI content generation (Gemini API or server AI)
- [ ] Test Stripe checkout flow
- [ ] Verify webhook is working
- [ ] Test all AI tools
- [ ] Check mobile responsiveness
- [ ] Verify analytics tracking
- [ ] Test all `/api/*` endpoints
- [ ] Verify CSP headers allow your production API domains (check browser console for CSP errors)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### API Routes Not Working
- Verify server directory structure
- Check Vercel function logs
- Ensure environment variables are set

### CORS Errors
- Update `FRONTEND_URL` in environment variables
- Check CSP headers in vercel.json
- Verify API endpoint URLs

