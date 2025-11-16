const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { verifyFirebaseToken } = require('../middleware/auth');
const admin = require('../firebaseAdmin');
const { sendReferralInvitation } = require('../utils/emailService');

/**
 * Send referral invitation email
 * POST /api/referrals/invite
 */
router.post('/invite', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address',
      });
    }
    
    // Get referrer info
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const referrerName = userData.displayName || userData.email || 'A friend';
    
    // Get or create referral link
    const referralDoc = await db.collection('referrals').doc(userId).get();
    let referralLink;
    
    if (referralDoc.exists) {
      const referralData = referralDoc.data();
      referralLink = referralData.referralLink || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${userId}`;
    } else {
      // Create referral link
      referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${userId}`;
      await db.collection('referrals').doc(userId).set({
        referralLink,
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Record referral invitation
    const invitationId = `${userId}_${Date.now()}`;
    await db.collection('referralInvitations').doc(invitationId).set({
      userId,
      email: email.trim().toLowerCase(),
      referralLink,
      status: 'sent',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Send invitation email
    const emailResult = await sendReferralInvitation({
      to: email.trim(),
      referrerName,
      referralLink,
    });
    
    if (!emailResult.success) {
      logger.warn('Failed to send referral invitation email', {
        email,
        userId,
        error: emailResult.error,
      });
      // Still return success if invitation was recorded, but log the email failure
    }
    
    res.json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    logger.error('Error sending referral invitation', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invitation',
    });
  }
});

module.exports = router;

