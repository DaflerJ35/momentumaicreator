const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // max 100 requests per window
  'Too many requests, please try again later.'
);

// Stricter limiter for authentication endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 requests per window
  'Too many authentication attempts, please try again later.'
);

// Security headers middleware
const securityHeaders = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Content Security Policy
  const cspDirectives = {
    defaultSrc: ["'self'"], // Default policy for loading content
    scriptSrc: [
      "'self'",
      'https://js.stripe.com',
      'https://cdn.jsdelivr.net',
      'https://cdnjs.cloudflare.com',
      ...(isDevelopment ? ["'unsafe-inline'", "'unsafe-eval'"] : []), // Allow in development only
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Required for some libraries
      'https://fonts.googleapis.com',
    ],
    fontSrc: ["'self'", 'https:', 'data:', 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
    connectSrc: [
      "'self'",
      // Stripe endpoints
      'https://api.stripe.com',
      'https://js.stripe.com',
      // Firebase endpoints - Auth, Realtime Database, Firestore, Storage
      'https://*.firebaseio.com',
      'https://*.firebase.com',
      'https://*.googleapis.com',
      'https://firebaseinstallations.googleapis.com',
      'https://identitytoolkit.googleapis.com',
      'https://securetoken.googleapis.com',
      'https://firestore.googleapis.com',
      'https://firebasestorage.googleapis.com',
      'wss://*.firebaseio.com',
      // Google Gemini AI endpoints
      'https://generativelanguage.googleapis.com',
      'https://ai.google.dev',
      ...(isDevelopment ? ['ws://localhost:*', 'http://localhost:*'] : []), // For development
    ],
    frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: isProduction ? [] : null,
  };

  // Build CSP string
  const cspString = Object.entries(cspDirectives)
    .filter(([_, value]) => value !== null)
    .map(([key, values]) => {
      const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return values.length > 0 ? `${directive} ${values.join(' ')}` : directive;
    })
    .join('; ');

  // Set security headers
  res.setHeader('Content-Security-Policy', cspString);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS in production only
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

// Base CORS configuration (to be enhanced in server.js with origin validation)
const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600, // Cache preflight for 10 minutes
  optionsSuccessStatus: 200,
};

// Input validation middleware
const validateInput = (validationRules) => {
  return async (req, res, next) => {
    await Promise.all(validationRules.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({ errors: errors.array() });
  };
};

// Request validation rules
const authValidation = {
  login: validateInput([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  register: validateInput([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
    body('name').trim().notEmpty().escape(),
  ]),
};

module.exports = {
  securityHeaders,
  apiLimiter,
  authLimiter,
  createRateLimiter,
  corsOptions,
  validateInput,
  authValidation,
};
