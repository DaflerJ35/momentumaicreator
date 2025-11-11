/**
 * Idempotency Store Service
 * 
 * Provides persistent storage for webhook event idempotency.
 * Supports Redis, Firebase/Firestore, and in-memory (development only).
 * 
 * Usage:
 *   const store = require('./services/idempotencyStore');
 *   const isProcessed = await store.isProcessed(eventId);
 *   await store.markProcessed(eventId, eventType);
 */

const logger = require('../utils/logger');

class IdempotencyStore {
  constructor() {
    this.store = null;
    this.storeType = this.detectStoreType();
    this.init();
  }

  detectStoreType() {
    // Prefer Redis if available
    if (process.env.REDIS_URL) {
      return 'redis';
    }
    
    // Fall back to Firebase if available
    if (process.env.FIREBASE_DATABASE_URL || process.env.FIREBASE_PROJECT_ID) {
      return 'firebase';
    }
    
    // Development fallback to in-memory (with warning)
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('Using in-memory idempotency store. Events will be lost on server restart. Consider using Redis or Firebase for production.');
      return 'memory';
    }
    
    // Production requires persistent store
    logger.error('No persistent idempotency store configured. Webhook idempotency may fail on server restart.');
    return 'memory';
  }

  async init() {
    try {
      switch (this.storeType) {
        case 'redis':
          await this.initRedis();
          break;
        case 'firebase':
          await this.initFirebase();
          break;
        case 'memory':
          this.initMemory();
          break;
      }
      logger.info(`Idempotency store initialized: ${this.storeType}`);
    } catch (error) {
      logger.error('Failed to initialize idempotency store', { error: error.message, storeType: this.storeType });
      // Fall back to memory if initialization fails
      this.storeType = 'memory';
      this.initMemory();
    }
  }

  async initRedis() {
    try {
      const redis = require('redis');
      const redisUrl = process.env.REDIS_URL;
      const redisPassword = process.env.REDIS_PASSWORD;
      
      const client = redis.createClient({
        url: redisUrl,
        password: redisPassword,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      client.on('error', (err) => {
        logger.error('Redis client error', { error: err.message });
      });

      client.on('connect', () => {
        logger.info('Redis client connected');
      });

      await client.connect();
      this.store = client;
      this.storeType = 'redis';
    } catch (error) {
      logger.error('Redis initialization failed', { error: error.message });
      throw error;
    }
  }

  async initFirebase() {
    try {
      const admin = require('../firebaseAdmin');
      
      // Verify Firebase Admin is initialized
      if (!admin.apps || admin.apps.length === 0) {
        throw new Error('Firebase Admin not initialized');
      }

      // Use Firestore if available, otherwise Realtime Database
      if (admin.firestore) {
        this.store = admin.firestore();
        this.storeType = 'firestore';
      } else if (admin.database) {
        this.store = admin.database();
        this.storeType = 'firebase-rtdb';
      } else {
        throw new Error('Firebase Firestore or Realtime Database not available');
      }
    } catch (error) {
      logger.error('Firebase initialization failed', { error: error.message });
      throw error;
    }
  }

  initMemory() {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => {
      this.cleanupMemory();
    }, 60 * 60 * 1000); // Cleanup every hour
  }

  cleanupMemory() {
    const now = Date.now();
    const ttl = 24 * 60 * 60 * 1000; // 24 hours
    let cleaned = 0;
    
    for (const [eventId, data] of this.store.entries()) {
      if (now - data.timestamp > ttl) {
        this.store.delete(eventId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired idempotency records from memory`);
    }
  }

  async isProcessed(eventId) {
    try {
      switch (this.storeType) {
        case 'redis':
          return await this.isProcessedRedis(eventId);
        case 'firestore':
          return await this.isProcessedFirestore(eventId);
        case 'firebase-rtdb':
          return await this.isProcessedFirebaseRTDB(eventId);
        case 'memory':
          return this.isProcessedMemory(eventId);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Error checking if event is processed', { eventId, error: error.message });
      // Fail open - allow processing if we can't check
      return false;
    }
  }

  async isProcessedRedis(eventId) {
    const key = `webhook:event:${eventId}`;
    const exists = await this.store.exists(key);
    return exists === 1;
  }

  async isProcessedFirestore(eventId) {
    const docRef = this.store.collection('webhook_events').doc(eventId);
    const doc = await docRef.get();
    return doc.exists;
  }

  async isProcessedFirebaseRTDB(eventId) {
    const ref = this.store.ref(`webhook_events/${eventId}`);
    const snapshot = await ref.once('value');
    return snapshot.exists();
  }

  isProcessedMemory(eventId) {
    return this.store.has(eventId);
  }

  async markProcessed(eventId, eventType) {
    try {
      const data = {
        eventId,
        eventType,
        timestamp: Date.now(),
        processed: true
      };

      switch (this.storeType) {
        case 'redis':
          await this.markProcessedRedis(eventId, data);
          break;
        case 'firestore':
          await this.markProcessedFirestore(eventId, data);
          break;
        case 'firebase-rtdb':
          await this.markProcessedFirebaseRTDB(eventId, data);
          break;
        case 'memory':
          this.markProcessedMemory(eventId, data);
          break;
      }
    } catch (error) {
      logger.error('Error marking event as processed', { eventId, error: error.message });
      // Don't throw - idempotency is best effort
    }
  }

  async markProcessedRedis(eventId, data) {
    const key = `webhook:event:${eventId}`;
    const ttl = 24 * 60 * 60; // 24 hours in seconds
    await this.store.setEx(key, ttl, JSON.stringify(data));
  }

  async markProcessedFirestore(eventId, data) {
    const docRef = this.store.collection('webhook_events').doc(eventId);
    await docRef.set(data);
    
    // Set TTL using Firestore TTL policy (requires Firestore TTL configuration)
    // Alternatively, use a scheduled function to clean up old records
  }

  async markProcessedFirebaseRTDB(eventId, data) {
    const ref = this.store.ref(`webhook_events/${eventId}`);
    await ref.set(data);
    
    // Set expiration using Firebase Functions or scheduled cleanup
  }

  markProcessedMemory(eventId, data) {
    this.store.set(eventId, data);
  }

  async close() {
    try {
      switch (this.storeType) {
        case 'redis':
          if (this.store) {
            try {
              await this.store.quit();
            } catch (error) {
              // Ignore errors if already closed
              if (!error.message.includes('Connection is closed')) {
                throw error;
              }
            }
          }
          break;
        case 'memory':
          if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
          }
          break;
        case 'firestore':
        case 'firebase-rtdb':
          // Firebase connections are managed by Firebase Admin SDK
          // No explicit close needed
          break;
      }
    } catch (error) {
      logger.error('Error closing idempotency store', { error: error.message });
    }
  }
}

// Export singleton instance
module.exports = new IdempotencyStore();

