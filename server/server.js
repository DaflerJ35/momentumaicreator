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

// Initialize Stripe only if secret key is provided
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  logger.warn('STRIPE_SECRET_KEY not set. Stripe features will be disabled.');
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

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
  if (!envOrigins) {
    // Development defaults
    return ['http://localhost:5173', 'http://localhost:3000'];
  }
  
  // Parse comma-separated origins and trim whitespace
  const origins = envOrigins.split(',').map(origin => origin.trim());
  
  // In production, avoid wildcards
  if (isProduction) {
    const hasWildcard = origins.some(origin => origin.includes('*'));
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
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
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
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    logger.error('Stripe not initialized. Cannot process webhook.');
    return res.status(503).json({ error: 'Stripe service unavailable' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    // Log full error details for debugging
    logger.error('Webhook signature verification failed', { 
      error: err.message,
      stack: err.stack 
    });
    // Don't expose technical error details to external services
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update your database here
      logger.info('Checkout session completed', { sessionId: session.id });
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      logger.info('Payment succeeded', { invoiceId: invoice.id });
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      logger.info('Subscription updated', { subscriptionId: subscription.id });
      break;
    default:
      logger.debug(`Unhandled webhook event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
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

// Product IDs - Must match the plans offered in src/pages/pricing/Pricing.jsx
// Plans: free (created automatically), pro, business, businessPlus
const PRODUCT_IDS = {
  pro: 'prod_TJIyRjl3xWWHRt',
  business: 'prod_TJIukefoISDIo5',
  businessPlus: 'prod_TAyrTk8MJeKZaS',
  // Note: businessPlus is marked as 'custom' in the UI with "Contact Sales" CTA,
  // but we maintain price IDs in case it's offered as a direct purchase option
  // Free product is created automatically via getFreeProductAndPrice()
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
      subscription_data: plan === 'free' ? {
        trial_period_days: 14,
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
        // Free plan: $0 subscription that never charges (effectively free forever)
        subscription_data: {
          // No trial needed since it's $0, but we require payment method
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Service - Import AI service
const aiService = require('./services/aiService');

// Import route modules
const teamRoutes = require('./routes/teams');
const multimediaRoutes = require('./routes/multimedia');
const platformRoutes = require('./routes/platforms');
const blogRoutes = require('./routes/blog');
const newsletterRoutes = require('./routes/newsletter');

// AI API Endpoints
// Generate content - REQUIRES AUTHENTICATION
app.post('/api/ai/generate', async (req, res) => {
  // Require authentication
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to use AI features'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Get Firebase Admin (it should already be initialized via firebaseAdmin.js)
    const admin = require('firebase-admin');
    
    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      logger.warn('Firebase Admin not initialized - authentication will fail');
      return res.status(503).json({ 
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (authError) {
    logger.error('AI generation auth error:', authError);
    if (authError.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Session expired',
        message: 'Please sign in again'
      });
    }
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Please sign in to use AI features'
    });
  }
  
  const { prompt, model, temperature, maxTokens, provider } = req.body;
  
  try {
    // Input validation and sanitization
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }
    
    // Sanitize prompt - remove null bytes and trim
    const sanitizedPrompt = prompt.replace(/\0/g, '').trim();
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({ error: 'Prompt cannot be empty' });
    }
    
    // Sanitize prompt length
    if (sanitizedPrompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt is too long. Maximum length is 10,000 characters.' });
    }
    
    // Validate temperature if provided
    if (temperature !== undefined) {
      const temp = parseFloat(temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return res.status(400).json({ error: 'Temperature must be a number between 0 and 2' });
      }
    }
    
    // Validate maxTokens if provided
    if (maxTokens !== undefined) {
      const tokens = parseInt(maxTokens);
      if (isNaN(tokens) || tokens < 1 || tokens > 8000) {
        return res.status(400).json({ error: 'Max tokens must be a number between 1 and 8000' });
      }
    }
    
    // Validate provider if provided
    if (provider && typeof provider !== 'string') {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    
    // Validate model if provided
    if (model && typeof model !== 'string') {
      return res.status(400).json({ error: 'Invalid model' });
    }

    const response = await aiService.generateContent(sanitizedPrompt, {
      model: model || undefined,
      temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
      maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
      provider: provider || undefined
    });

    res.json({ content: response });
  } catch (error) {
    // Log full error details for debugging (server-side only)
    logger.error('AI generation error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.uid 
    });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to generate content. Please try again.' });
  }
});

// Generate structured content (JSON) - REQUIRES AUTHENTICATION
app.post('/api/ai/generate-structured', async (req, res) => {
  // Require authentication
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to use AI features'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Get Firebase Admin (it should already be initialized via firebaseAdmin.js)
    const admin = require('firebase-admin');
    
    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      logger.warn('Firebase Admin not initialized - authentication will fail');
      return res.status(503).json({ 
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (authError) {
    logger.error('AI structured generation auth error:', authError);
    if (authError.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Session expired',
        message: 'Please sign in again'
      });
    }
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Please sign in to use AI features'
    });
  }
  
  const { prompt, schema, model, temperature, maxTokens, provider } = req.body;
  
  try {
    // Input validation and sanitization
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }
    
    // Sanitize prompt
    const sanitizedPrompt = prompt.replace(/\0/g, '').trim();
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({ error: 'Prompt cannot be empty' });
    }
    
    if (sanitizedPrompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt is too long. Maximum length is 10,000 characters.' });
    }
    
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      return res.status(400).json({ error: 'Schema is required and must be a valid object' });
    }
    
    // Validate schema is not too large (prevent DoS)
    const schemaString = JSON.stringify(schema);
    if (schemaString.length > 50000) {
      return res.status(400).json({ error: 'Schema is too large. Maximum size is 50KB.' });
    }
    
    // Validate temperature if provided
    if (temperature !== undefined) {
      const temp = parseFloat(temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return res.status(400).json({ error: 'Temperature must be a number between 0 and 2' });
      }
    }
    
    // Validate maxTokens if provided
    if (maxTokens !== undefined) {
      const tokens = parseInt(maxTokens);
      if (isNaN(tokens) || tokens < 1 || tokens > 8000) {
        return res.status(400).json({ error: 'Max tokens must be a number between 1 and 8000' });
      }
    }

    const response = await aiService.generateStructuredContent(sanitizedPrompt, schema, {
      model: model || undefined,
      temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
      maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
      provider: provider || undefined
    });

    res.json({ data: response });
  } catch (error) {
    // Log full error details for debugging (server-side only)
    logger.error('AI structured generation error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.uid 
    });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to generate structured content. Please try again.' });
  }
});

// Stream content (Server-Sent Events) - REQUIRES AUTHENTICATION
app.post('/api/ai/stream', async (req, res) => {
  // Require authentication
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to use AI features'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Get Firebase Admin (it should already be initialized via firebaseAdmin.js)
    const admin = require('firebase-admin');
    
    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      logger.warn('Firebase Admin not initialized - authentication will fail');
      return res.status(503).json({ 
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (authError) {
    logger.error('AI stream auth error:', authError);
    if (authError.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Session expired',
        message: 'Please sign in again'
      });
    }
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Please sign in to use AI features'
    });
  }
  
  const { prompt, model, temperature, maxTokens, provider, jsonMode } = req.body;
  
  try {
    // Input validation and sanitization
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }
    
    // Sanitize prompt
    const sanitizedPrompt = prompt.replace(/\0/g, '').trim();
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({ error: 'Prompt cannot be empty' });
    }
    
    // Sanitize prompt length
    if (sanitizedPrompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt is too long. Maximum length is 10,000 characters.' });
    }
    
    // Validate temperature if provided
    if (temperature !== undefined) {
      const temp = parseFloat(temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        return res.status(400).json({ error: 'Temperature must be a number between 0 and 2' });
      }
    }
    
    // Validate maxTokens if provided
    if (maxTokens !== undefined) {
      const tokens = parseInt(maxTokens);
      if (isNaN(tokens) || tokens < 1 || tokens > 8000) {
        return res.status(400).json({ error: 'Max tokens must be a number between 1 and 8000' });
      }
    }
    
    // Validate provider if provided
    if (provider && typeof provider !== 'string') {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    
    // Validate model if provided
    if (model && typeof model !== 'string') {
      return res.status(400).json({ error: 'Invalid model' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Track client disconnection
    let clientClosed = false;
    res.on('close', () => {
      clientClosed = true;
    });

    // Create AbortController for upstream cancellation
    const abortController = new AbortController();

    // Heartbeat interval - send comment line every 20 seconds to keep connection alive
    // Clients should handle these comment lines (they start with ':')
    const HEARTBEAT_INTERVAL = 20000; // 20 seconds
    const heartbeatInterval = setInterval(() => {
      if (clientClosed) {
        clearInterval(heartbeatInterval);
        return;
      }
      // Send SSE comment line (keeps connection alive, ignored by EventSource)
      res.write(': heartbeat\n\n');
    }, HEARTBEAT_INTERVAL);

    // Maximum stream duration - abort after 5 minutes to prevent indefinite connections
    const MAX_STREAM_DURATION = 300000; // 5 minutes
    const maxDurationTimeout = setTimeout(() => {
      if (!clientClosed) {
        logger.warn('AI stream exceeded maximum duration, aborting', { duration: MAX_STREAM_DURATION });
        abortController.abort();
        clientClosed = true;
        clearInterval(heartbeatInterval);
        res.write(`data: ${JSON.stringify({ error: 'Stream timeout: maximum duration exceeded', done: true })}\n\n`);
        res.end();
      }
    }, MAX_STREAM_DURATION);

    // Cleanup function to clear all timers
    const cleanup = () => {
      clearInterval(heartbeatInterval);
      clearTimeout(maxDurationTimeout);
    };

    try {
      for await (const chunk of aiService.generateStreamingContent(sanitizedPrompt, {
        model: model || undefined,
        temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
        maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
        provider: provider || undefined,
        jsonMode: jsonMode || false,
        signal: abortController.signal
      })) {
        // Check if client disconnected before writing
        if (clientClosed) {
          abortController.abort();
          cleanup();
          return;
        }
        res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      }
      
      // Check again before sending final message
      if (clientClosed) {
        cleanup();
        return;
      }
      
      // Clear timers on successful completion
      cleanup();
      res.write(`data: ${JSON.stringify({ chunk: '', done: true })}\n\n`);
      res.end();
    } catch (error) {
      // Clear timers on error
      cleanup();
      
      // Don't write error if client already disconnected
      if (clientClosed) {
        return;
      }
      
      // Don't expose technical error details in SSE stream
      res.write(`data: ${JSON.stringify({ error: 'Failed to stream content', done: true })}\n\n`);
      res.end();
    }
  } catch (error) {
    // Log full error details for debugging (server-side only)
    logger.error('AI streaming error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.uid 
    });
    // Don't expose technical error details to users
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream content. Please try again.' });
    }
  }
});

// Analyze image - REQUIRES AUTHENTICATION
app.post('/api/ai/analyze-image', async (req, res) => {
  // Require authentication
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please sign in to use AI features'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Get Firebase Admin (it should already be initialized via firebaseAdmin.js)
    const admin = require('firebase-admin');
    
    // Check if Firebase Admin is initialized
    if (!admin.apps || admin.apps.length === 0) {
      logger.warn('Firebase Admin not initialized - authentication will fail');
      return res.status(503).json({ 
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (authError) {
    logger.error('AI image analysis auth error:', authError);
    if (authError.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Session expired',
        message: 'Please sign in again'
      });
    }
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Please sign in to use AI features'
    });
  }
  
  const { imageData, prompt } = req.body;
  
  try {
    // Input validation and sanitization
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'Image data is required and must be a valid string' });
    }
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }
    
    // Sanitize prompt
    const sanitizedPrompt = prompt.replace(/\0/g, '').trim();
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({ error: 'Prompt cannot be empty' });
    }
    
    // Sanitize prompt length
    if (sanitizedPrompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt is too long. Maximum length is 1,000 characters.' });
    }
    
    // Validate image data format (basic check)
    if (!imageData.startsWith('data:image/') && !imageData.startsWith('http://') && !imageData.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }
    
    // Validate URL if it's a URL (prevent SSRF)
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      try {
        const url = new URL(imageData);
        // Block private IPs and localhost
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.startsWith('192.168.') || url.hostname.startsWith('10.') || url.hostname.startsWith('172.')) {
          return res.status(400).json({ error: 'Invalid image URL' });
        }
      } catch (urlError) {
        return res.status(400).json({ error: 'Invalid image URL format' });
      }
    }

    const response = await aiService.analyzeImage(imageData, sanitizedPrompt);
    res.json({ analysis: response });
  } catch (error) {
    // Log full error details for debugging (server-side only)
    logger.error('AI image analysis error', { 
      error: error.message, 
      stack: error.stack,
      userId: req.user?.uid 
    });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
  }
});

// Get available models - PUBLIC endpoint (no auth required)
app.get('/api/ai/models', (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json({ models, provider: aiService.provider });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error getting models', { error: error.message, stack: error.stack });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to get available models. Please try again.' });
  }
});

// Register team and multimedia routes
app.use('/api/teams', teamRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/newsletter', newsletterRoutes);

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

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, { 
      env: process.env.NODE_ENV,
      port: PORT 
    });
    
    // Start scheduler service
    try {
      const schedulerService = require('./services/schedulerService');
      schedulerService.startScheduler();
      logger.info('Scheduler service started');
    } catch (error) {
      logger.error(`Failed to start scheduler: ${error.message}`);
    }
  });
}
