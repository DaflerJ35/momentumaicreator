require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');

// Import security middleware and logger (must be before Stripe initialization)
const { securityHeaders, apiLimiter, createRateLimiter } = require('./middleware/security');
const logger = require('./utils/logger');
const admin = require('./firebaseAdmin');

// Create logs directory if it doesn't exist (skip on serverless like Vercel)
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // Make stripe available to trial validation middleware
  app.set('stripe', stripe);
} else {
  logger.warn('STRIPE_SECRET_KEY not set. Stripe features will be disabled.');
}

// Security Middleware
app.use(helmet());
app.use(securityHeaders);

// Enable CORS with secure defaults - using configuration from security middleware
const { corsOptions } = require('./middleware/security');

/**
 * CORS Configuration
 * 
 * The FRONTEND_URL environment variable supports comma-separated values for multiple origins.
 * Example: FRONTEND_URL=http://localhost:5173,https://app.example.com,https://staging.example.com
 * 
 * For production:
 * - Always specify exact origins (no wildcards)
 * - Include all production domains and subdomains explicitly
 * - Include staging/preview URLs if needed
 * 
 * For development:
 * - Defaults to http://localhost:5173 and http://localhost:3000 if not set
 * - Wildcards are allowed in development but not recommended
 */
const parseOrigins = (envOrigins) => {
  const origins = [];

  // Always include Vercel URLs if in Vercel environment
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL) {
    // Include common Vercel preview/production patterns
    origins.push('https://*.vercel.app');
    origins.push('https://*.vercel.app/*');
  }

  if (envOrigins) {
    // Parse comma-separated origins and trim whitespace
    const parsed = envOrigins.split(',').map(origin => origin.trim());
    origins.push(...parsed);
  } else if (!isProduction) {
    // Development defaults
    origins.push('http://localhost:5173', 'http://localhost:3000');
  }

  // In production, avoid wildcards (except for Vercel)
  if (isProduction) {
    const hasWildcard = origins.some(origin => origin.includes('*') && !origin.includes('vercel.app'));
    if (hasWildcard) {
      logger.warn('Wildcard origins detected in production. This is a security risk.');
    }
  }

  return origins;
};

const allowedOrigins = parseOrigins(process.env.FRONTEND_URL);

// Enhanced CORS options with origin validation
const enhancedCorsOptions = {
  ...corsOptions,
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) in development only
    if (!origin && !isProduction) {
      return callback(null, true);
    }

    // Check exact match first
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check Vercel wildcard patterns
    if (process.env.VERCEL && origin) {
      try {
        const url = new URL(origin);
        // Allow any *.vercel.app subdomain
        if (url.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch (e) {
        // Invalid URL, continue to rejection
      }
    }

    // Check if origin matches any pattern (for wildcards)
    const matchesPattern = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return false;
    });

    if (matchesPattern) {
      return callback(null, true);
    }

    logger.warn(`CORS blocked request from origin: ${origin}`, {
      allowedOrigins: allowedOrigins.slice(0, 3) // Log first 3 for debugging
    });
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(enhancedCorsOptions));
app.options('*', cors(enhancedCorsOptions)); // Enable pre-flight for all routes

// Rate limiting
app.use('/api/', apiLimiter);

// Stricter rate limiting for contact form endpoint (anti-abuse)
const contactLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 requests per window per IP
  'Too many contact form submissions. Please try again later.'
);

/**
 * IMPORTANT: Webhook handler must be mounted BEFORE any body parsers (express.json, express.urlencoded)
 * to access the raw request body for Stripe signature verification.
 * 
 * Stripe webhook signature verification requires the raw body buffer, which is lost after
 * body parsing middleware processes the request. This route must remain above all body
 * parsing middleware to ensure signature verification works correctly.
 * 
 * DO NOT MOVE THIS ROUTE BELOW express.json() or express.urlencoded() middleware.
 * Doing so will break webhook signature verification and expose the application to
 * unauthorized webhook events.
 */

// Stricter rate limiting for webhook endpoint (prevent abuse)
const webhookLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // max 10 requests per minute per IP
  'Too many webhook requests. Please try again later.'
);

// Webhook idempotency store (persistent: Redis/Firebase in production, memory in development)
const idempotencyStore = require('./services/idempotencyStore');

app.post('/api/webhook', webhookLimiter, express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    logger.error('Stripe not initialized. Cannot process webhook.');
    return res.status(503).json({ error: 'Stripe service unavailable' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Log full error details for debugging
    logger.error('Webhook signature verification failed', {
      error: err.message,
      stack: err.stack,
      ip: req.ip
    });
    // Don't expose technical error details to external services
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Idempotency check: skip if event was already processed
  const isProcessed = await idempotencyStore.isProcessed(event.id);
  if (isProcessed) {
    logger.info('Webhook event already processed, skipping', {
      eventId: event.id,
      eventType: event.type
    });
    // Return 200 to acknowledge receipt (Stripe expects 2xx for idempotent handling)
    return res.status(200).json({ received: true, message: 'Event already processed' });
  }

  // Mark event as processed immediately to prevent duplicate processing
  await idempotencyStore.markProcessed(event.id, event.type);

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        // Update your database here
        logger.info('Checkout session completed', {
          sessionId: session.id,
          customerEmail: session.customer_email,
          amount: session.amount_total
        });
        // Persist subscription state in Firestore keyed by user ID from metadata
        try {
          const userId = session.metadata?.userId || session.metadata?.user_id || session.client_reference_id;
          if (userId) {
            let subData = {
              status: 'completed',
              plan: session.metadata?.plan || null,
              updated_at: new Date().toISOString(),
              customer: session.customer || null,
              session_id: session.id
            };
            // If subscription id is present, fetch details
            if (session.subscription) {
              try {
                const sub = await stripe.subscriptions.retrieve(session.subscription);
                subData = {
                  ...subData,
                  status: sub.status,
                  current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                  canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
                  subscription_id: sub.id,
                  plan: sub.items?.data?.[0]?.price?.id || sub.items?.data?.[0]?.price?.nickname || subData.plan || null
                };
              } catch (e) {
                logger.warn('Unable to fetch subscription for checkout.session.completed', { error: e.message });
              }
            }
            try {
              await admin.firestore().collection('subscriptions').doc(userId).set(subData, { merge: true });
              logger.info('Subscription state persisted (checkout.session.completed)', { userId });
            } catch (e) {
              logger.error('Failed to persist subscription state', { error: e.message });
            }
          } else {
            logger.warn('No userId metadata on checkout.session.completed; skipping subscription persistence');
          }
        } catch (e) {
          logger.error('Error during subscription persistence for checkout.session.completed', { error: e.message });
        }
        break;
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        logger.info('Payment succeeded', {
          invoiceId: invoice.id,
          customer: invoice.customer,
          amount: invoice.amount_paid
        });
        // Update subscription status in Firestore if we can infer userId from metadata
        try {
          const userId = invoice.metadata?.userId || invoice.metadata?.user_id;
          if (userId) {
            const subId = invoice.subscription || null;
            const subData = {
              status: 'active',
              updated_at: new Date().toISOString(),
              customer: invoice.customer || null,
              subscription_id: subId
            };
            // Try to get current period end from subscription
            if (subId) {
              try {
                const sub = await stripe.subscriptions.retrieve(subId);
                subData.status = sub.status || subData.status;
                subData.current_period_end = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
                subData.canceled_at = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;
                subData.plan = sub.items?.data?.[0]?.price?.id || null;
              } catch (e) {
                logger.warn('Unable to fetch subscription for invoice.payment_succeeded', { error: e.message });
              }
            }
            await admin.firestore().collection('subscriptions').doc(userId).set(subData, { merge: true });
            logger.info('Subscription state persisted (invoice.payment_succeeded)', { userId });
          }
        } catch (e) {
          logger.error('Failed to persist subscription state on invoice.payment_succeeded', { error: e.message });
        }
        break;
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        logger.info('Subscription updated', {
          subscriptionId: subscription.id,
          status: subscription.status,
          customer: subscription.customer
        });
        // Persist subscription status using userId from metadata if present
        try {
          const userId = subscription.metadata?.userId || subscription.metadata?.user_id;
          if (userId) {
            const subData = {
              status: subscription.status,
              plan: subscription.items?.data?.[0]?.price?.id || subscription.items?.data?.[0]?.price?.nickname || null,
              current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
              customer: subscription.customer || null,
              subscription_id: subscription.id
            };
            await admin.firestore().collection('subscriptions').doc(userId).set(subData, { merge: true });
            logger.info('Subscription state persisted (customer.subscription.updated)', { userId });
          } else {
            logger.warn('No userId metadata on customer.subscription.updated; skipping subscription persistence');
          }
        } catch (e) {
          logger.error('Failed to persist subscription state on customer.subscription.updated', { error: e.message });
        }
        break;
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        logger.info('Subscription deleted', {
          subscriptionId: deletedSubscription.id,
          customer: deletedSubscription.customer
        });
        // Mark subscription as canceled in Firestore
        try {
          const userId = deletedSubscription.metadata?.userId || deletedSubscription.metadata?.user_id;
          if (userId) {
            await admin.firestore().collection('subscriptions').doc(userId).set({
              status: 'canceled',
              canceled_at: deletedSubscription.canceled_at ? new Date(deletedSubscription.canceled_at * 1000).toISOString() : new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_id: deletedSubscription.id,
              customer: deletedSubscription.customer || null
            }, { merge: true });
            logger.info('Subscription state persisted (customer.subscription.deleted)', { userId });
          } else {
            logger.warn('No userId metadata on customer.subscription.deleted; skipping subscription persistence');
          }
        } catch (e) {
          logger.error('Failed to persist subscription state on customer.subscription.deleted', { error: e.message });
        }
        break;
      default:
        logger.debug(`Unhandled webhook event type: ${event.type}`, { eventId: event.id });
    }

    // Return a 200 response quickly to acknowledge receipt of the event
    // Stripe will retry if it doesn't receive a 2xx response within a few seconds
    res.status(200).json({ received: true, eventId: event.id });
  } catch (error) {
    // Note: We don't remove from idempotency store on error to prevent duplicate processing
    // If the event processing fails, it should be handled manually or via retry logic
    // The idempotency store will expire the event after 24 hours (TTL)
    logger.error('Error processing webhook event', {
      eventId: event.id,
      eventType: event.type,
      error: error.message,
      stack: error.stack
    });
    // Return 500 to signal Stripe to retry (Stripe will handle retries with exponential backoff)
    res.status(500).json({ error: 'Error processing webhook event' });
  }
});

// Body parser, reading data from body into req.body (must come after webhook handler)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Request logging
app.use(morgan('combined', { stream: logger.stream }));
app.use(logger.requestLogger);

// Security headers for all responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Cron-triggered scheduler endpoint (for serverless environments)
// Configure a Vercel Cron job to POST this endpoint with header X-Cron-Secret
app.post('/api/scheduler/run', async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      logger.warn('CRON_SECRET not set; refusing to run scheduler endpoint');
      return res.status(503).json({ error: 'Scheduler not configured' });
    }

    const provided = req.headers['x-cron-secret'] || req.headers['x-cronkey'] || req.query.secret;
    if (provided !== cronSecret) {
      logger.warn('Unauthorized scheduler run attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { processScheduledPosts } = require('./services/schedulerService');
    logger.info('Scheduler run invoked via /api/scheduler/run');
    await processScheduledPosts();
    logger.info('Scheduler run completed');
    return res.json({ ok: true });
  } catch (error) {
    logger.error('Scheduler run failed', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Scheduler run failed' });
  }
});

// Cache for free product/price IDs (created once, reused)
let freeProductId = null;
let freePriceId = null;

// Helper function to get or create free product and price
const getFreeProductAndPrice = async () => {
  try {
    // Return cached values if available
    if (freeProductId && freePriceId) {
      return { productId: freeProductId, priceId: freePriceId };
    }

    // Check if free product already exists
    const products = await stripe.products.list({ limit: 100, active: true });
    let freeProduct = products.data.find(p => p.name === 'Free Momentum' || p.metadata?.plan === 'free');

    if (!freeProduct) {
      // Create free product
      freeProduct = await stripe.products.create({
        name: 'Free Momentum',
        description: 'Free plan with limited features',
        metadata: { plan: 'free' }
      });
    }

    freeProductId = freeProduct.id;

    // Check if $0 price exists for this product
    const prices = await stripe.prices.list({ product: freeProductId, active: true, limit: 100 });
    let freePrice = prices.data.find(p => p.unit_amount === 0 && p.recurring?.interval === 'month');

    if (!freePrice) {
      // Create $0 price for free product
      freePrice = await stripe.prices.create({
        product: freeProductId,
        unit_amount: 0,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: { plan: 'free' }
      });
    }

    freePriceId = freePrice.id;

    return { productId: freeProductId, priceId: freePriceId };
  } catch (error) {
    logger.error('Error getting/creating free product:', error);
    throw error;
  }
};

// Product IDs - Can be overridden via environment variables
// Plans: free (created automatically), pro, business, businessPlus
// In production, set these via env vars to match your Stripe dashboard
const PRODUCT_IDS = {
  pro: process.env.STRIPE_PRO_PRODUCT_ID || 'prod_TJIyRjl3xWWHRt',
  business: process.env.STRIPE_BUSINESS_PRODUCT_ID || 'prod_TJIukefoISDIo5',
  businessPlus: process.env.STRIPE_BUSINESS_PLUS_PRODUCT_ID || 'prod_TAyrTk8MJeKZaS',
  // Note: businessPlus is marked as 'custom' in the UI with "Contact Sales" CTA,
  // but we maintain price IDs in case it's offered as a direct purchase option
  // Free product is created automatically via getFreeProductAndPrice()
  // Free product can be overridden: STRIPE_FREE_PRODUCT_ID (optional)
};

// Price IDs from your Stripe dashboard
// Must exactly match the plans and billing cycles offered in src/pages/pricing/Pricing.jsx
// Supported plans: pro, business, businessPlus
// Supported billing cycles: monthly, 6months, 12months
// Configure these environment variables in server/.env (use server/.env.example as template)
const PRICE_IDS = {
  monthly: {
    pro: process.env.STRIPE_MONTHLY_PRO_PRICE_ID,
    business: process.env.STRIPE_MONTHLY_BUSINESS_PRICE_ID,
    businessPlus: process.env.STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID,
  },
  '6months': {
    pro: process.env.STRIPE_6MONTH_PRO_PRICE_ID,
    business: process.env.STRIPE_6MONTH_BUSINESS_PRICE_ID,
    businessPlus: process.env.STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID,
  },
  '12months': {
    pro: process.env.STRIPE_YEARLY_PRO_PRICE_ID,
    business: process.env.STRIPE_YEARLY_BUSINESS_PRICE_ID,
    businessPlus: process.env.STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID,
  }
};

// Create a checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) {
    logger.error('Stripe not initialized. Cannot create checkout session.');
    return res.status(503).json({ error: 'Payment service unavailable. Please contact support.' });
  }

  const { plan, billingCycle, customerEmail, selectedAddOns = [], finalPrice } = req.body;

  // REQUIRE AUTHENTICATION - Verify Firebase token
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please sign in to continue with your subscription'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const admin = require('./firebaseAdmin');

    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      logger.error('Firebase Admin not initialized');
      return res.status(503).json({
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };

    // Use authenticated user's email if customerEmail not provided
    const emailToUse = customerEmail || decodedToken.email;
    if (!emailToUse) {
      return res.status(400).json({
        error: 'Email required',
        message: 'Email address is required for checkout'
      });
    }
  } catch (authError) {
    logger.error('Authentication error in checkout:', authError);

    // Provide more specific error messages
    if (authError.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Session expired',
        message: 'Please sign in again to continue'
      });
    } else if (authError.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Session revoked',
        message: 'Please sign in again to continue'
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Please sign in to continue with your subscription'
    });
  }

  try {
    // SECURITY: Check trial eligibility before creating checkout session
    const trialValidation = require('./services/trialValidation');
    const clientIP = trialValidation.getClientIP(req);
    const trialEligibility = await trialValidation.checkTrialEligibility(
      req.user.email,
      clientIP,
      req.user.uid
    );

    if (!trialEligibility.allowed) {
      logger.warn(`Trial eligibility check failed for user ${req.user.uid}: ${trialEligibility.reason}`);
      return res.status(403).json({
        error: 'Trial not available',
        message: trialEligibility.reason || 'You are not eligible for a trial. Please contact support.',
      });
    }

    // Handle Business Plus with custom add-ons
    if (plan === 'businessPlus' && finalPrice) {
      // For Business Plus, calculate the base price and add-on prices
      const addOnsTotal = selectedAddOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
      const basePrice = finalPrice - addOnsTotal;

      // Determine billing interval
      let interval = 'month';
      let intervalCount = 1;
      if (billingCycle === '6months') {
        intervalCount = 6;
      } else if (billingCycle === '12months') {
        interval = 'year';
        intervalCount = 1;
      }

      // Create a custom price for the total amount (base + add-ons)
      const lineItems = [{
        price_data: {
          currency: 'usd',
          product: PRODUCT_IDS[plan] || PRODUCT_IDS.businessPlus || '',
          recurring: {
            interval: interval,
            interval_count: intervalCount,
          },
          unit_amount: Math.round(finalPrice * 100), // Convert to cents
        },
        quantity: 1,
      }];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'subscription',
        automatic_tax: { enabled: true },
        // REQUIRE PAYMENT METHOD for ALL plans (including free) to prevent abuse
        payment_method_collection: 'always',
        // For free plans, set trial period but still require card
        // SECURITY: 3-day trial period (locked down to prevent abuse)
        subscription_data: plan === 'free' ? {
          trial_period_days: 3,
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel'
            }
          }
        } : undefined,
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
        customer_email: customerEmail || req.user.email,
        metadata: {
          plan,
          billing_cycle: billingCycle,
          product_id: PRODUCT_IDS[plan] || '',
          add_ons: JSON.stringify(selectedAddOns),
          base_price: basePrice.toString(),
          add_ons_total: addOnsTotal.toString(),
          final_price: finalPrice.toString(),
          user_id: req.user.uid,
        }
      });

      // Track account creation for IP
      trialValidation.addAccountToIPTracking(clientIP, req.user.uid);
      res.json({ sessionId: session.id });
      return;
    }

    // Handle free plan - create $0 subscription with payment method required
    if (plan === 'free') {
      // Get or create free product and price
      const { priceId } = await getFreeProductAndPrice();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price: priceId, // Use the $0 price ID
          quantity: 1,
        }],
        mode: 'subscription',
        payment_method_collection: 'always', // REQUIRE payment method
        // SECURITY: Free plan with 3-day trial (locked down to prevent abuse)
        subscription_data: {
          trial_period_days: 3,
          trial_settings: {
            end_behavior: {
              missing_payment_method: 'cancel'
            }
          }
        },
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
        customer_email: customerEmail || req.user.email,
        metadata: {
          plan: 'free',
          billing_cycle: billingCycle,
          user_id: req.user.uid,
        }
      });

      // Track account creation for IP
      trialValidation.addAccountToIPTracking(clientIP, req.user.uid);
      res.json({ sessionId: session.id });
      return;
    }

    // Standard plan handling
    const priceId = PRICE_IDS[billingCycle]?.[plan];

    // Handle missing yearly Pro plan gracefully
    if (!priceId || priceId === 'NO_YEARLY_PLAN_EXISTS_FOR_PRO') {
      return res.status(400).json({
        error: 'Invalid plan or billing cycle',
        message: plan === 'pro' && billingCycle === '12months'
          ? 'Yearly Pro plan is not available. Please choose monthly or 6-month billing.'
          : 'The selected plan and billing cycle combination is not available.'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      automatic_tax: { enabled: true },
      // REQUIRE PAYMENT METHOD for ALL plans to prevent abuse
      payment_method_collection: 'always',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing?payment=cancelled`,
      customer_email: customerEmail || req.user.email,
      metadata: {
        plan,
        billing_cycle: billingCycle,
        product_id: PRODUCT_IDS[plan] || '',
        user_id: req.user.uid,
      }
    });

    // Track account creation for IP (for standard plans)
    trialValidation.addAccountToIPTracking(clientIP, req.user.uid);

    res.json({ sessionId: session.id });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error creating checkout session', { error: error.message, stack: error.stack });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
});

// Webhook handler has been moved above express.json() middleware

// Health check endpoint
// Enhanced health check endpoint with diagnostics
app.get('/api/health', (req, res) => {
  const aiProvider = process.env.AI_PROVIDER || 'not set';
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const ollamaConfigured = !!(process.env.OLLAMA_URL || process.env.OLLAMA_API_URL);
  const flowithConfigured = !!(
    (process.env.FLOWITH_API_KEY && (process.env.FLOWITH_API_URL || process.env.FLOWITH_BASE_URL))
  );

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'not set',
      vercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL || 'not set',
      region: process.env.VERCEL_REGION || 'not set'
    },
    services: {
      firebase: !!admin.apps.length,
      aiProvider,
      aiConfigured: geminiConfigured || openaiConfigured || ollamaConfigured || flowithConfigured,
      providers: {
        gemini: geminiConfigured,
        ollama: ollamaConfigured,
        openai: openaiConfigured,
        flowith: flowithConfigured,
      },
      stripe: !!stripe
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      limit: process.env.VERCEL ? '3008 MB (Vercel)' : 'unlimited'
    }
  };

  res.json(health);
});

// Import route modules
const teamRoutes = require('./routes/teams');
const multimediaRoutes = require('./routes/multimedia');
const platformRoutes = require('./routes/platforms');
const blogRoutes = require('./routes/blog');
const newsletterRoutes = require('./routes/newsletter');
const analyticsRoutes = require('./routes/analytics');
const referralRoutes = require('./routes/referrals');
const aiRoutes = require('./routes/ai');

// Import auth middleware
const { verifyFirebaseToken } = require('./middleware/auth');
const { aiLimiter } = require('./middleware/security');

// Register routes
app.use('/api/teams', teamRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/ai', aiRoutes);

// Marketplace checkout endpoint
app.post('/api/marketplace/checkout', async (req, res) => {
  if (!stripe) {
    logger.error('Stripe not initialized. Cannot create marketplace checkout session.');
    return res.status(503).json({ error: 'Payment service unavailable. Please contact support.' });
  }

  const { itemId, itemName, price, customerEmail } = req.body;

  try {
    // Verify Firebase token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      const admin = require('./firebaseAdmin');
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!itemId || !itemName || !price || !customerEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'itemId, itemName, price, and customerEmail are required'
      });
    }

    // Create a one-time payment checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
              description: `Marketplace item purchase`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      automatic_tax: { enabled: true },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/growth/marketplace?payment=success&itemId=${itemId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/growth/marketplace?payment=cancelled`,
      customer_email: customerEmail,
      metadata: {
        type: 'marketplace_purchase',
        itemId: itemId,
        itemName: itemName,
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error creating marketplace checkout session', { error: error.message, stack: error.stack });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to create checkout session. Please try again.' });
  }
});

// Helper function to escape HTML
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Contact form endpoint with stricter rate limiting and input sanitization
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, company, phone, subject, message, _honeypot } = req.body;

  try {
    // Honeypot check - if filled, it's likely a bot
    if (_honeypot) {
      logger.warn('Honeypot field filled, likely spam', { ip: req.ip });
      // Return success to not alert bots
      return res.json({ success: true, message: 'Message sent successfully' });
    }

    // Validation: Required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, subject, and message are required'
      });
    }

    // Sanitize and validate inputs
    const sanitizedName = String(name || '').trim().replace(/[<>]/g, '').slice(0, 100);
    const sanitizedEmail = String(email || '').trim().toLowerCase().slice(0, 100);
    const sanitizedSubject = String(subject || '').trim().toLowerCase();
    const sanitizedMessage = String(message || '').trim().replace(/\0/g, '').slice(0, 5000);
    const sanitizedCompany = company ? String(company).trim().replace(/[<>]/g, '').slice(0, 100) : '';
    const sanitizedPhone = phone ? String(phone).trim().replace(/[^0-9+\-() ]/g, '').slice(0, 20) : '';

    // Validate: Name cannot be empty after sanitization
    if (sanitizedName.length === 0) {
      return res.status(400).json({
        error: 'Invalid name',
        message: 'Please provide a valid name'
      });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validation: Message cannot be empty after sanitization
    if (sanitizedMessage.length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message cannot be empty'
      });
    }

    // Validation: Subject must be from allowed list
    const allowedSubjects = ['general', 'sales', 'enterprise', 'support', 'partnership', 'other'];
    if (!allowedSubjects.includes(sanitizedSubject)) {
      return res.status(400).json({
        error: 'Invalid subject',
        message: 'Please select a valid subject'
      });
    }

    // Log the contact form submission (use sanitized values)
    logger.info('Contact form submission received', {
      name: sanitizedName,
      email: sanitizedEmail,
      company: sanitizedCompany || 'N/A',
      phone: sanitizedPhone || 'N/A',
      subject: sanitizedSubject,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Send email if mail provider is configured
    const nodemailer = require('nodemailer');

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Momentum AI Contact Form'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'sales@momentumai.com',
        replyTo: sanitizedEmail,
        subject: `Contact Form: ${sanitizedSubject} - from ${sanitizedName}`,
        text: `
Name: ${sanitizedName}
Email: ${sanitizedEmail}
Company: ${sanitizedCompany || 'N/A'}
Phone: ${sanitizedPhone || 'N/A'}
Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}
        `,
        html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
<p><strong>Email:</strong> <a href="mailto:${escapeHtml(sanitizedEmail)}">${escapeHtml(sanitizedEmail)}</a></p>
<p><strong>Company:</strong> ${escapeHtml(sanitizedCompany || 'N/A')}</p>
<p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone || 'N/A')}</p>
<p><strong>Subject:</strong> ${escapeHtml(sanitizedSubject)}</p>
<h3>Message:</h3>
<p>${escapeHtml(sanitizedMessage).replace(/\n/g, '<br>')}</p>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info('Contact form email sent successfully', { to: mailOptions.to });
    } else {
      logger.warn('SMTP not configured, email not sent. Contact form data logged only.');
    }

    res.json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!'
    });

  } catch (error) {
    logger.error('Error processing contact form', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Failed to send message',
      details: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  try {
  } catch (error) {
    logger.error('Error closing idempotency store', { error: error.message });
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export the app for testing
module.exports = app;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

    // Start scheduler only in non-serverless environments
    // In Vercel, use Cron Jobs to hit /api/scheduler/run
    if (!process.env.VERCEL) {
      const { startScheduler } = require('./services/schedulerService');
      startScheduler();
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
  });
}
