const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const logger = require('../utils/logger');
const { body, validationResult } = require('express-validator');
const { createRateLimiter } = require('../middleware/security');

// Rate limiter for newsletter subscriptions (5 requests per 15 minutes per IP)
const newsletterLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // max 5 requests per window
  'Too many newsletter subscription attempts. Please try again later.'
);

/**
 * Newsletter Subscription Route
 * POST /api/newsletter/subscribe
 * 
 * Subscribes an email to the newsletter by storing it in Firebase Firestore
 */
router.post('/subscribe', newsletterLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      logger.error('Firebase Admin not initialized. Cannot subscribe email.');
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Newsletter service is currently unavailable. Please try again later.'
      });
    }

    const db = admin.firestore();
    const newsletterRef = db.collection('newsletter');

    // Check if email already exists
    const existingSubscriber = await newsletterRef
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingSubscriber.empty) {
      // Email already subscribed
      logger.info('Newsletter subscription attempt for existing email', { email });
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        alreadySubscribed: true
      });
    }

    // Add new subscriber
    const subscriberData = {
      email: email,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      source: req.headers.referer || 'unknown',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    await newsletterRef.add(subscriberData);

    logger.info('New newsletter subscriber added', { email });

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      email: email
    });

  } catch (error) {
    logger.error('Newsletter subscription error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });

    // Don't expose internal error details
    res.status(500).json({
      error: 'Subscription failed',
      message: 'Unable to process subscription. Please try again later.'
    });
  }
});

/**
 * Unsubscribe Route (for future use)
 * POST /api/newsletter/unsubscribe
 */
router.post('/unsubscribe', newsletterLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    if (!admin.apps.length) {
      logger.error('Firebase Admin not initialized. Cannot unsubscribe email.');
      return res.status(503).json({
        error: 'Service unavailable'
      });
    }

    const db = admin.firestore();
    const newsletterRef = db.collection('newsletter');

    // Find and update subscriber status
    const subscriberQuery = await newsletterRef
      .where('email', '==', email)
      .limit(1)
      .get();

    if (subscriberQuery.empty) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Email address not found in our newsletter list.'
      });
    }

    const subscriberDoc = subscriberQuery.docs[0];
    await subscriberDoc.ref.update({
      status: 'unsubscribed',
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info('Newsletter unsubscribed', { email });

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter.'
    });

  } catch (error) {
    logger.error('Newsletter unsubscribe error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Unsubscribe failed',
      message: 'Unable to process unsubscribe request. Please try again later.'
    });
  }
});

module.exports = router;

