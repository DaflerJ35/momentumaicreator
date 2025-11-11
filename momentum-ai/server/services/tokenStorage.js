const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Load encryption key from environment variable
// In development: set TOKEN_ENCRYPTION_KEY in .env or .env.local for a stable key
// This prevents token decryption failures after server restarts
// In production: TOKEN_ENCRYPTION_KEY is required
let ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;

// In development, try to load from .env.local if not set (dotenv loads .env by default)
// This allows developers to use .env.local for local overrides without committing secrets
if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'development') {
  try {
    const envLocalPath = path.join(__dirname, '../../.env.local');
    if (fs.existsSync(envLocalPath)) {
      // Parse .env.local to get TOKEN_ENCRYPTION_KEY
      const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
      const lines = envLocalContent.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^TOKEN_ENCRYPTION_KEY=(.+)$/);
          if (match) {
            ENCRYPTION_KEY = match[1].trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
            break;
          }
        }
      }
    }
  } catch (error) {
    // Silently fail - will throw error below if key is still not set
    logger.warn('Could not load TOKEN_ENCRYPTION_KEY from .env.local:', error.message);
  }
}

const ALGORITHM = 'aes-256-gcm';

// Validate encryption key - required in all environments for stability
// Never generate a random key in development to prevent token decryption failures
if (!ENCRYPTION_KEY) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = isDevelopment
    ? 'TOKEN_ENCRYPTION_KEY environment variable is required in development. ' +
      'Set a fixed key in .env or .env.local to prevent token decryption failures after restarts. ' +
      'Generate a key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    : 'TOKEN_ENCRYPTION_KEY environment variable is required in production';
  throw new Error(errorMessage);
}

// Validate encryption key format (64 hex chars = 32 bytes)
// This fails fast on misconfiguration before creating ciphers/deciphers
if (!/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
  throw new Error('TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
}

/**
 * Encrypt sensitive token data
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * Decrypt sensitive token data
 */
function decrypt(encryptedData) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Store platform tokens securely (encrypted, server-only access)
 */
async function storePlatformTokens(userId, platformId, tokens) {
  try {
    const db = getFirestore();
    const tokensRef = db.collection('platform_tokens').doc(`${userId}_${platformId}`);
    
    // Encrypt sensitive fields
    const encryptedTokens = {
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      pageAccessToken: tokens.pageAccessToken ? encrypt(tokens.pageAccessToken) : null,
      igUserId: tokens.igUserId || null,
      expiresAt: tokens.expiresAt,
      scope: tokens.scope,
      connectedAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await tokensRef.set(encryptedTokens);
    
    logger.info(`Stored encrypted tokens for ${platformId}, user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error storing platform tokens: ${error.message}`);
    throw error;
  }
}

/**
 * Get platform tokens (decrypted)
 */
async function getPlatformTokens(userId, platformId) {
  try {
    const db = getFirestore();
    const tokensRef = db.collection('platform_tokens').doc(`${userId}_${platformId}`);
    const doc = await tokensRef.get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    
    // Decrypt tokens
    const decrypted = {
      accessToken: decrypt(data.accessToken),
      refreshToken: data.refreshToken ? decrypt(data.refreshToken) : null,
      pageAccessToken: data.pageAccessToken ? decrypt(data.pageAccessToken) : null,
      igUserId: data.igUserId || null,
      expiresAt: data.expiresAt,
      scope: data.scope,
      connectedAt: data.connectedAt,
      updatedAt: data.updatedAt,
    };
    
    // Always return decrypted tokens, even if expired
    // Expiry check and refresh logic is handled in platformService.js
    return decrypted;
  } catch (error) {
    logger.error(`Error getting platform tokens: ${error.message}`);
    return null;
  }
}

/**
 * Get all connected platforms for a user (without tokens)
 */
async function getConnectedPlatforms(userId) {
  try {
    const db = getFirestore();
    const tokensRef = db.collection('platform_tokens');
    
    // Query all documents and filter by userId prefix
    const snapshot = await tokensRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs
      .filter(doc => doc.id.startsWith(`${userId}_`))
      .map(doc => {
        const id = doc.id;
        const platformId = id.split('_').slice(1).join('_'); // Handle platform IDs with underscores
        const data = doc.data();
        
        return {
          platformId,
          connectedAt: data.connectedAt,
          updatedAt: data.updatedAt,
          expiresAt: data.expiresAt,
          scope: data.scope,
        };
      });
  } catch (error) {
    logger.error(`Error getting connected platforms: ${error.message}`);
    return [];
  }
}

/**
 * Disconnect a platform (delete tokens)
 */
async function disconnectPlatform(userId, platformId) {
  try {
    const db = getFirestore();
    const tokensRef = db.collection('platform_tokens').doc(`${userId}_${platformId}`);
    await tokensRef.delete();
    
    logger.info(`Disconnected ${platformId} for user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error disconnecting platform: ${error.message}`);
    throw error;
  }
}

/**
 * Update tokens (for refresh)
 */
async function updatePlatformTokens(userId, platformId, tokens) {
  try {
    const db = getFirestore();
    const tokensRef = db.collection('platform_tokens').doc(`${userId}_${platformId}`);
    
    const updateData = {
      updatedAt: Date.now(),
    };
    
    if (tokens.accessToken) {
      updateData.accessToken = encrypt(tokens.accessToken);
    }
    
    if (tokens.refreshToken !== undefined) {
      updateData.refreshToken = tokens.refreshToken ? encrypt(tokens.refreshToken) : null;
    }
    
    if (tokens.expiresAt !== undefined) {
      updateData.expiresAt = tokens.expiresAt;
    }
    
    if (tokens.scope) {
      updateData.scope = tokens.scope;
    }
    
    if (tokens.pageAccessToken !== undefined) {
      updateData.pageAccessToken = tokens.pageAccessToken ? encrypt(tokens.pageAccessToken) : null;
    }
    
    if (tokens.igUserId !== undefined) {
      updateData.igUserId = tokens.igUserId;
    }
    
    await tokensRef.update(updateData);
    
    logger.info(`Updated tokens for ${platformId}, user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error updating platform tokens: ${error.message}`);
    throw error;
  }
}

module.exports = {
  storePlatformTokens,
  getPlatformTokens,
  getConnectedPlatforms,
  disconnectPlatform,
  updatePlatformTokens,
};

