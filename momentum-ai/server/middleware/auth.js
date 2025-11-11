const admin = require('../firebaseAdmin');
const logger = require('../utils/logger');

/**
 * Verify Firebase ID token
 */
async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token with checkRevoked flag for production
    const checkRevoked = process.env.NODE_ENV === 'production';
    const decodedToken = await admin.auth().verifyIdToken(idToken, checkRevoked);
    
    // Verify audience and issuer
    const expectedAudience = process.env.FIREBASE_PROJECT_ID;
    const expectedIssuer = `https://securetoken.googleapis.com/v1/projects/${expectedAudience}`;
    
    if (decodedToken.aud !== expectedAudience) {
      throw new Error('Token audience mismatch');
    }
    
    if (!decodedToken.iss || !decodedToken.iss.startsWith('https://securetoken.googleapis.com')) {
      throw new Error('Token issuer mismatch');
    }
    
    // Check for clock skew (allow 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const clockSkew = 300; // 5 minutes
    if (decodedToken.exp && decodedToken.exp < (now - clockSkew)) {
      throw new Error('Token expired');
    }
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
    
    next();
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`, {
      code: error.code,
      stack: error.stack,
    });
    
    // Provide more specific error messages
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/id-token-revoked') {
      res.status(401).json({
        success: false,
        error: 'Token expired or revoked. Please sign in again.',
      });
    } else if (error.code === 'auth/argument-error') {
      res.status(401).json({
        success: false,
        error: 'Invalid token format',
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  }
}

module.exports = {
  verifyFirebaseToken,
};

