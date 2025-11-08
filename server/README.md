# Momentum AI Server

Backend server for handling payments and subscriptions for Momentum AI.

## Setup

1. Copy `.env.example` to `.env` and fill in your Stripe API keys:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Your frontend URL for CORS
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook secret for verifying Stripe events
- `STRIPE_*_PRICE_ID`: Price IDs for your subscription plans

## API Endpoints

- `POST /api/create-checkout-session`: Create a new checkout session
- `POST /api/webhook`: Stripe webhook handler
- `GET /api/health`: Health check endpoint

## Stripe Setup

1. Create products and prices in your Stripe Dashboard
2. Set up webhooks in the Stripe Dashboard pointing to `https://your-domain.com/api/webhook`
3. Add the webhook signing secret to your `.env` file

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Make sure all environment variables are properly set
3. Use a process manager like PM2 to keep the server running

## License

ISC
