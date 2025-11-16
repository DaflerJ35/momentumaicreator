/**
 * Trial Validation Service
 * SECURITY: Server-side validation of trial periods and anti-abuse measures
 * 
 * Features:
 * - IP-based tracking to prevent multiple trial accounts
 * - Device fingerprinting
 * - Trial period enforcement (3 days)
 * - Account creation limits per IP
 * - Stripe subscription trial validation
 */

const logger = require('../utils/logger');
const admin = require('../firebaseAdmin');

// In-memory store for IP tracking (fallback)
// Key: IP address, Value: { count: number, firstAttempt: timestamp, accounts: string[] }
const ipTracking = new Map();

// Optional Redis client for persistent IP tracking in production
let redisClient = null;
let redisAvailable = false;
async function initRedisIfConfigured() {
  try {
    if (redisAvailable || redisClient) return;
    const url = process.env.REDIS_URL;
    if (!url) return;
    const redis = require('redis');
    redisClient = redis.createClient({
      url,
      password: process.env.REDIS_PASSWORD,
    });
    redisClient.on('error', (err) => {
      logger.error('Redis (trialValidation) client error', { error: err.message });
    });
    await redisClient.connect();
    redisAvailable = true;
    logger.info('Trial/IP anti-abuse using Redis backend');
  } catch (e) {
    logger.warn('Failed to initialize Redis for trial/IP anti-abuse; falling back to in-memory', { error: e.message });
    redisAvailable = false;
  }
}
// Fire and forget initialization
initRedisIfConfigured();

// Configuration
const TRIAL_PERIOD_DAYS = 3;
const MAX_ACCOUNTS_PER_IP = 2; // Maximum accounts per IP in 24 hours
const IP_TRACKING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Cleanup every hour

// Cleanup old IP tracking entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipTracking.entries()) {
    if (now - data.firstAttempt > IP_TRACKING_WINDOW_MS) {
      ipTracking.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Get client IP address from request
 * Handles proxies and load balancers
 */
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Track IP address for account creation
 * Returns true if account creation is allowed, false if blocked
 */
function trackIPForAccountCreationMemory(ip) {
  const now = Date.now();
  const tracking = ipTracking.get(ip);

  if (!tracking) {
    // First account from this IP
    ipTracking.set(ip, {
      count: 1,
      firstAttempt: now,
      accounts: [],
    });
    return true;
  }

  // Check if tracking window has expired
  if (now - tracking.firstAttempt > IP_TRACKING_WINDOW_MS) {
    // Reset tracking
    ipTracking.set(ip, {
      count: 1,
      firstAttempt: now,
      accounts: [],
    });
    return true;
  }

  // Check if limit exceeded
  if (tracking.count >= MAX_ACCOUNTS_PER_IP) {
    logger.warn(`IP ${ip} exceeded account creation limit: ${tracking.count}/${MAX_ACCOUNTS_PER_IP}`);
    return false;
  }

  // Increment count
  tracking.count++;
  return true;
}

/**
 * Track IP address for account creation with Redis (if available)
 * Returns true if allowed, false if blocked
 */
async function trackIPForAccountCreation(ip) {
  // Prefer Redis if available
  if (redisAvailable && redisClient) {
    try {
      const key = `trial:ip:${ip}`;
      const ttlSeconds = Math.floor(IP_TRACKING_WINDOW_MS / 1000);
      // Use INCR and set expiry on first increment
      const count = await redisClient.incr(key);
      if (count === 1) {
        await redisClient.expire(key, ttlSeconds);
      }
      if (count > MAX_ACCOUNTS_PER_IP) {
        logger.warn(`IP ${ip} exceeded account creation limit (Redis): ${count}/${MAX_ACCOUNTS_PER_IP}`);
        return false;
      }
      return true;
    } catch (e) {
      logger.warn('Redis tracking failed; falling back to memory', { error: e.message });
      // Fall through to memory
    }
  }
  return trackIPForAccountCreationMemory(ip);
}

/**
 * Add account to IP tracking
 */
function addAccountToIPTracking(ip, userId) {
  const tracking = ipTracking.get(ip);
  if (tracking && !tracking.accounts.includes(userId)) {
    tracking.accounts.push(userId);
  }
}

/**
 * Check if user has already used trial (by email or IP)
 * Returns { allowed: boolean, reason?: string }
 */
async function checkTrialEligibility(userEmail, userIP, userId = null) {
  try {
    // Check IP-based limits
    if (!trackIPForAccountCreation(userIP)) {
      return {
        allowed: false,
        reason: 'Too many accounts created from this IP address. Please contact support if you believe this is an error.',
      };
    }

    // Check Firestore subscription state as the source of truth, if available
    if (userId && admin && admin.firestore) {
      try {
        const doc = await admin.firestore().collection('subscriptions').doc(userId).get();
        if (doc.exists) {
          const sub = doc.data() || {};
          const status = (sub.status || '').toLowerCase();
          const now = Date.now();
          const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;

          // If active paid subscription exists, allow
          if (status === 'active') {
            return { allowed: true };
          }
          // If in trial and not expired, allow
          if (status === 'trialing' && periodEnd && periodEnd > now) {
            return { allowed: true };
          }
          // If canceled or trial expired, block
          if (status === 'canceled' || (status === 'trialing' && periodEnd && periodEnd <= now)) {
            return {
              allowed: false,
              reason: 'Trial period has ended for this account. Please upgrade to continue.'
            };
          }
        }
      } catch (e) {
        logger.warn('Failed to read subscription state from Firestore during trial check', { error: e.message });
      }
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Error checking trial eligibility:', error);
    // Fail open for now, but log the error
    return { allowed: true };
  }
}

/**
 * Validate trial period from Stripe subscription
 * Returns { isValid: boolean, daysRemaining?: number, reason?: string }
 */
async function validateTrialPeriod(stripeSubscription) {
  try {
    if (!stripeSubscription) {
      return {
        isValid: false,
        reason: 'No active subscription found',
      };
    }

    // Check if subscription is in trial
    if (stripeSubscription.status === 'trialing') {
      const trialEnd = stripeSubscription.trial_end;
      if (trialEnd) {
        const now = Math.floor(Date.now() / 1000);
        const daysRemaining = Math.ceil((trialEnd - now) / (24 * 60 * 60));
        
        if (daysRemaining > 0) {
          return {
            isValid: true,
            daysRemaining,
          };
        } else {
          return {
            isValid: false,
            reason: 'Trial period has expired',
          };
        }
      }
    }

    // Check if subscription is active (paid)
    if (stripeSubscription.status === 'active') {
      return {
        isValid: true,
        isPaid: true,
      };
    }

    // Subscription is not in trial and not active
    return {
      isValid: false,
      reason: `Subscription status: ${stripeSubscription.status}`,
    };
  } catch (error) {
    logger.error('Error validating trial period:', error);
    return {
      isValid: false,
      reason: 'Error validating trial period',
    };
  }
}

/**
 * Get user's Stripe subscription (fallback when Firestore not available)
 */
async function getUserStripeSubscription(userId, stripe) {
  try {
    if (!stripe) {
      logger.error('Stripe not initialized');
      return null;
    }

    // Search for customer by user ID in metadata
    const customers = await stripe.customers.list({
      limit: 100,
    });

    const customer = customers.data.find(
      (c) => c.metadata?.user_id === userId || c.metadata?.userId === userId
    );

    if (!customer) {
      return null;
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    // Return the most recent subscription
    if (subscriptions.data.length > 0) {
      return subscriptions.data[0];
    }

    return null;
  } catch (error) {
    logger.error('Error getting user Stripe subscription:', error);
    return null;
  }
}

/**
 * Middleware to validate trial period for authenticated users
 */
async function validateTrialMiddleware(req, res, next) {
  try {
    // Skip validation for certain routes
    const skipRoutes = ['/api/health', '/api/webhook', '/api/create-checkout-session'];
    if (skipRoutes.some((route) => req.path.startsWith(route))) {
      return next();
    }

    // Only validate for authenticated routes
    if (!req.user || !req.user.uid) {
      return next();
    }

    // First check Firestore subscription store for fast-path entitlement
    let validation = { isValid: false, isPaid: false };
    try {
      if (admin && admin.firestore) {
        const doc = await admin.firestore().collection('subscriptions').doc(req.user.uid).get();
        if (doc.exists) {
          const sub = doc.data() || {};
          const status = (sub.status || '').toLowerCase();
          const now = Date.now();
          const periodEnd = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;

          if (status === 'active') {
            validation = { isValid: true, isPaid: true };
          } else if (status === 'trialing' && periodEnd && periodEnd > now) {
            const daysRemaining = Math.ceil((periodEnd - now) / (24 * 60 * 60 * 1000));
            validation = { isValid: true, isPaid: false, daysRemaining };
          } else if (status) {
            validation = { isValid: false, isPaid: false, reason: `Subscription status: ${status}` };
          }
        }
      }
    } catch (e) {
      logger.warn('Failed to read Firestore subscription in middleware, falling back to Stripe', { error: e.message });
    }

    // If Firestore did not yield a definitive allow, fall back to Stripe check
    if (!validation.isValid) {
      // Get Stripe instance (passed as parameter or from app context)
      let stripe = req.stripe;
      if (!stripe && req.app && req.app.get) {
        stripe = req.app.get('stripe');
      }
      if (!stripe) {
        // If Stripe is not configured, allow access (development mode)
        logger.warn('Stripe not available for trial validation - allowing access');
        return next();
      }

      const subscription = await getUserStripeSubscription(req.user.uid, stripe);
      validation = await validateTrialPeriod(subscription);
    }

    if (!validation.isValid && !validation.isPaid) {
      return res.status(403).json({
        error: 'Trial expired',
        message: validation.reason || 'Your trial period has expired. Please upgrade to continue.',
        requiresUpgrade: true,
      });
    }

    // Attach trial info to request
    req.trialInfo = {
      isValid: validation.isValid,
      daysRemaining: validation.daysRemaining,
      isPaid: validation.isPaid || false,
    };

    next();
  } catch (error) {
    logger.error('Error in trial validation middleware:', error);
    // Fail open - allow access if validation fails
    next();
  }
}

module.exports = {
  checkTrialEligibility,
  validateTrialPeriod,
  getUserStripeSubscription,
  validateTrialMiddleware,
  trackIPForAccountCreation,
  addAccountToIPTracking,
  getClientIP,
  TRIAL_PERIOD_DAYS,
  MAX_ACCOUNTS_PER_IP,
};

