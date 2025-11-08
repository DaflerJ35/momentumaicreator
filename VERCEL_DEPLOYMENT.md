# 🚀 Vercel Deployment Guide for Momentum AI

## Quick Deploy Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select GitHub and authorize
   - Select `DaflerJ35/momentumaicreator`

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

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
   VITE_APP_URL=https://your-app.vercel.app
   ```

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
   FRONTEND_URL=https://your-app.vercel.app
   ```

4. **API Routes Setup**
   - Vercel will automatically detect the `server/` directory
   - API routes will be available at `/api/*`
   - Serverless functions will handle backend requests

5. **Stripe Webhook Configuration**
   - In Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Important Notes

- ✅ The `vercel.json` is already configured
- ✅ CSP headers are set for security
- ✅ API routes are configured for serverless functions
- ⚠️ Make sure all environment variables are set before deploying
- ⚠️ Update `FRONTEND_URL` after first deployment

## Post-Deployment Checklist

- [ ] Test authentication (Firebase)
- [ ] Test AI content generation (Gemini API)
- [ ] Test Stripe checkout flow
- [ ] Verify webhook is working
- [ ] Test all AI tools
- [ ] Check mobile responsiveness
- [ ] Verify analytics tracking

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

