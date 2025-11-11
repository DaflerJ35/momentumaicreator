/**
 * Firebase Admin SDK Initialization
 * Initialize once at server startup and export shared instance
 */

const admin = require('firebase-admin');
const logger = require('./utils/logger');

let initialized = false;

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }

  try {
    // Get service account from environment variable (JSON string) or file path
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    let serviceAccount;
    
    if (serviceAccountPath) {
      // If path is provided, load from file
      const fs = require('fs');
      const path = require('path');
      const accountPath = path.resolve(serviceAccountPath);
      if (!fs.existsSync(accountPath)) {
        logger.warn(`Firebase service account file not found at: ${accountPath}`);
        return;
      }
      serviceAccount = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // If JSON string is provided in env
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      logger.warn('Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT');
      return;
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    initialized = true;
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    // Don't throw - allow server to start even if Firebase is not configured
    // Routes that need Firebase will handle the error appropriately
    // But log a warning so it's clear Firebase is not available
    logger.warn('Firebase Admin SDK not available. Authentication endpoints will return 503 errors.');
  }
}

// Auto-initialize on first require
initializeFirebaseAdmin();

module.exports = admin;

