const crypto = require('crypto');
const { getDatabase } = require('firebase-admin/database');
const logger = require('./logger');

// Server secret for HMAC signing (required in production)
const STATE_SECRET = process.env.OAUTH_STATE_SECRET || (process.env.NODE_ENV === 'development' ? crypto.randomBytes(32).toString('hex') : null);

// Validate state secret in production
if (process.env.NODE_ENV !== 'development' && !STATE_SECRET) {
  throw new Error('OAUTH_STATE_SECRET environment variable is required in production');
}

// TTL for state storage (15 minutes)
const STATE_TTL = 15 * 60 * 1000;

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Generate a signed state ID
 */
function generateStateId() {
  const randomId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', STATE_SECRET)
    .update(`${randomId}:${timestamp}`)
    .digest('hex');
  
  return Buffer.from(JSON.stringify({
    id: randomId,
    ts: timestamp,
    sig: signature,
  })).toString('base64url');
}

/**
 * Verify and parse state ID
 */
function verifyStateId(stateId) {
  try {
    const stateData = JSON.parse(Buffer.from(stateId, 'base64url').toString());
    const { id, ts, sig } = stateData;
    
    // Check TTL
    if (Date.now() - ts > STATE_TTL) {
      throw new Error('State expired');
    }
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', STATE_SECRET)
      .update(`${id}:${ts}`)
      .digest('hex');
    
    if (sig !== expectedSig) {
      throw new Error('Invalid state signature');
    }
    
    return id;
  } catch (error) {
    logger.error(`State verification failed: ${error.message}`);
    throw new Error('Invalid state');
  }
}

/**
 * Store OAuth state data (code_verifier, userId, platformId)
 */
async function storeOAuthState(stateId, data) {
  try {
    const db = getDatabase();
    const stateRef = db.ref(`oauth_states/${stateId}`);
    
    await stateRef.set({
      ...data,
      createdAt: Date.now(),
    });
    
    // Auto-cleanup after TTL
    setTimeout(async () => {
      try {
        await stateRef.remove();
      } catch (err) {
        logger.warn(`Failed to cleanup OAuth state ${stateId}: ${err.message}`);
      }
    }, STATE_TTL);
    
    return true;
  } catch (error) {
    logger.error(`Error storing OAuth state: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieve and delete OAuth state data
 */
async function retrieveOAuthState(stateId) {
  try {
    const db = getDatabase();
    const stateRef = db.ref(`oauth_states/${stateId}`);
    const snapshot = await stateRef.once('value');
    
    if (!snapshot.exists()) {
      throw new Error('State not found or expired');
    }
    
    const data = snapshot.val();
    
    // Check TTL
    if (Date.now() - data.createdAt > STATE_TTL) {
      await stateRef.remove();
      throw new Error('State expired');
    }
    
    // Delete after retrieval (one-time use)
    await stateRef.remove();
    
    return data;
  } catch (error) {
    logger.error(`Error retrieving OAuth state: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generatePKCE,
  generateStateId,
  verifyStateId,
  storeOAuthState,
  retrieveOAuthState,
};

