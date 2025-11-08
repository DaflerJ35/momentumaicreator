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
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
    
    next();
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

module.exports = {
  verifyFirebaseToken,
};

