const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const logger = require('../utils/logger');
const { verifyFirebaseToken } = require('../middleware/auth');
const platformService = require('../services/platformService');
const postingService = require('../services/platformPostingService');
const { 
  generatePKCE, 
  generateStateId, 
  verifyStateId, 
  storeOAuthState, 
  retrieveOAuthState 
} = require('../utils/oauthState');
const oauthService = require('../services/oauthService');

// Platform OAuth and API integrations
// This handles ALL platforms: OnlyFans, Fansly, Fanvue, Fanplace, Instagram, Twitter, etc.

/**
 * Initialize OAuth flow for a platform
 * GET /api/platforms/:platformId/oauth/init
 */
router.get('/:platformId/oauth/init', verifyFirebaseToken, async (req, res) => {
  const correlationId = crypto.randomUUID();
  try {
    const { platformId } = req.params;
    const userId = req.user.uid;
    
    logger.info(`OAuth init for platform: ${platformId}, user: ${userId}`, { correlationId });
    
    // Generate PKCE for platforms that require it
    const requiresPKCE = ['twitter', 'linkedin', 'tiktok'];
    const pkce = requiresPKCE.includes(platformId) ? generatePKCE() : null;
    
    // Generate signed state ID
    const stateId = generateStateId();
    
    // Store state data server-side
    await storeOAuthState(stateId, {
      userId,
      platformId,
      codeVerifier: pkce?.codeVerifier,
      correlationId,
    });
    
    // Generate OAuth URL with state_id and code_challenge
    const oauthUrl = await oauthService.getOAuthUrl(platformId, userId, stateId, pkce?.codeChallenge);
    
    res.json({
      success: true,
      oauthUrl,
      platformId,
      correlationId,
    });
  } catch (error) {
    logger.error(`OAuth init error: ${error.message}`, { correlationId, error: error.stack });
    res.status(500).json({
      success: false,
      error: error.message,
      correlationId,
    });
  }
});

/**
 * OAuth callback handler
 * GET /api/platforms/:platformId/oauth/callback
 * Note: This route doesn't use verifyFirebaseToken because OAuth callbacks come from external services
 */
router.get('/:platformId/oauth/callback', async (req, res) => {
  let correlationId = null;
  try {
    const { platformId } = req.params;
    const { code, state, error, error_description } = req.query;
    
    // Map provider errors to friendly codes
    const errorMap = {
      'access_denied': 'PROVIDER_DENIED',
      'invalid_request': 'INVALID_REQUEST',
      'unauthorized_client': 'UNAUTHORIZED_CLIENT',
      'unsupported_response_type': 'UNSUPPORTED_RESPONSE',
      'invalid_scope': 'INVALID_SCOPE',
      'server_error': 'PROVIDER_ERROR',
    };
    
    if (error) {
      const errorCode = errorMap[error] || 'PROVIDER_ERROR';
      correlationId = crypto.randomUUID();
      logger.error(`OAuth error from ${platformId}: ${error}`, { 
        correlationId, 
        error_description,
        error_code: errorCode 
      });
      
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error_code=${errorCode}&cid=${correlationId}`
      );
    }
    
    if (!code || !state) {
      correlationId = crypto.randomUUID();
      logger.error(`Missing code or state for ${platformId}`, { correlationId });
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error_code=MISSING_PARAMS&cid=${correlationId}`
      );
    }
    
    // Verify and retrieve state data
    let stateData;
    try {
      const stateId = verifyStateId(state);
      stateData = await retrieveOAuthState(stateId);
      correlationId = stateData.correlationId || crypto.randomUUID();
    } catch (e) {
      correlationId = crypto.randomUUID();
      logger.error(`Invalid or expired state: ${e.message}`, { correlationId });
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error_code=INVALID_STATE&cid=${correlationId}`
      );
    }
    
    const userId = stateData.userId;
    if (!userId) {
      correlationId = crypto.randomUUID();
      logger.error(`Missing userId in state data`, { correlationId });
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error_code=MISSING_USER_ID&cid=${correlationId}`
      );
    }
    
    logger.info(`OAuth callback for platform: ${platformId}, user: ${userId}`, { correlationId });
    
    // Exchange code for access token (pass code_verifier if available)
    const tokens = await oauthService.exchangeOAuthCode(platformId, code, stateData.codeVerifier, correlationId);
    
    // Store tokens securely
    await platformService.storePlatformTokens(userId, platformId, tokens);
    
    logger.info(`Successfully connected ${platformId} for user ${userId}`, { correlationId });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?connected=${platformId}&cid=${correlationId}`);
  } catch (error) {
    const errorCode = 'TOKEN_EXCHANGE_FAILED';
    correlationId = correlationId || crypto.randomUUID();
    logger.error(`OAuth callback error: ${error.message}`, { 
      correlationId, 
      error: error.stack,
      platformId: req.params.platformId 
    });
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error_code=${errorCode}&cid=${correlationId}`
    );
  }
});

/**
 * Get connected platforms for user
 * GET /api/platforms/connected
 */
// Explicit preflight handler to ensure CORS preflight doesn't hit auth or redirects
router.options('/connected', (req, res) => {
  // Global CORS middleware already sets the appropriate headers
  return res.sendStatus(204);
});
router.get('/connected', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const connectedPlatforms = await platformService.getConnectedPlatforms(userId);
    
    res.json({
      success: true,
      platforms: connectedPlatforms,
    });
  } catch (error) {
    logger.error(`Get connected platforms error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Disconnect a platform
 * DELETE /api/platforms/:platformId
 */
router.delete('/:platformId', verifyFirebaseToken, async (req, res) => {
  try {
    const { platformId } = req.params;
    const userId = req.user.uid;
    
    await platformService.disconnectPlatform(userId, platformId);
    
    res.json({
      success: true,
      message: `Disconnected from ${platformId}`,
    });
  } catch (error) {
    logger.error(`Disconnect platform error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Post content to a platform
 * POST /api/platforms/:platformId/post
 */
router.post('/:platformId/post', verifyFirebaseToken, async (req, res) => {
  try {
    const { platformId } = req.params;
    const userId = req.user.uid;
    const { content, media, scheduleTime, options } = req.body;
    
    logger.info(`Posting to ${platformId} for user ${userId}`);
    
    // If scheduled, store for later
    if (scheduleTime && new Date(scheduleTime) > new Date()) {
      const postId = await platformService.storeScheduledPost(userId, {
        platformId,
        content,
        media,
        scheduleTime: new Date(scheduleTime).getTime(),
        options,
      });
      
      return res.json({
        success: true,
        scheduled: true,
        postId,
        scheduleTime,
      });
    }
    
    // Post immediately
    const result = await postingService.postToPlatform(platformId, userId, {
      content,
      media,
      options,
    });
    
    // Store analytics
    await platformService.storePostAnalytics(userId, platformId, result.postId, {
      impressions: 0,
      engagements: 0,
      reach: 0,
      clicks: 0,
    });
    
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error(`Post to platform error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Schedule content for multiple platforms
 * POST /api/platforms/schedule
 */
router.post('/schedule', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { platforms, content, media, scheduleTime, options } = req.body;
    
    logger.info(`Scheduling content for ${platforms.length} platforms, user: ${userId}`);
    
    // If scheduled, store all posts
    if (scheduleTime && new Date(scheduleTime) > new Date()) {
      const results = await Promise.allSettled(
        platforms.map(platformId => 
          platformService.storeScheduledPost(userId, {
            platformId,
            content,
            media,
            scheduleTime: new Date(scheduleTime).getTime(),
            options,
          })
        )
      );
      
      return res.json({
        success: true,
        scheduled: true,
        results: results.map((r, i) => ({
          platform: platforms[i],
          success: r.status === 'fulfilled',
          postId: r.status === 'fulfilled' ? r.value : null,
          error: r.status === 'rejected' ? r.reason.message : null,
        })),
      });
    }
    
    // Post immediately to all platforms
    const results = await Promise.allSettled(
      platforms.map(platformId => 
        postingService.postToPlatform(platformId, userId, { content, media, options })
      )
    );
    
    // Store analytics for successful posts
    await Promise.all(
      results.map(async (r, i) => {
        if (r.status === 'fulfilled' && r.value.postId) {
          await platformService.storePostAnalytics(userId, platforms[i], r.value.postId, {
            impressions: 0,
            engagements: 0,
            reach: 0,
            clicks: 0,
          });
        }
      })
    );
    
    res.json({
      success: true,
      results: results.map((r, i) => ({
        platform: platforms[i],
        success: r.status === 'fulfilled',
        result: r.status === 'fulfilled' ? r.value : r.reason.message,
      })),
    });
  } catch (error) {
    logger.error(`Schedule content error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get scheduled posts
 * GET /api/platforms/scheduled
 */
router.get('/scheduled', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 50;
    
    const posts = await platformService.getScheduledPosts(userId, limit);
    
    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    logger.error(`Get scheduled posts error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Delete scheduled post
 * DELETE /api/platforms/scheduled/:postId
 */
router.delete('/scheduled/:postId', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { postId } = req.params;
    
    await platformService.deleteScheduledPost(userId, postId);
    
    res.json({
      success: true,
      message: 'Scheduled post deleted',
    });
  } catch (error) {
    logger.error(`Delete scheduled post error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete scheduled post',
    });
  }
});

/**
 * Get platform analytics
 * GET /api/platforms/:platformId/analytics
 */
router.get('/:platformId/analytics', verifyFirebaseToken, async (req, res) => {
  try {
    const { platformId } = req.params;
    const { startDate, endDate } = req.query;
    const userId = req.user.uid;
    
    const analytics = await platformService.getPlatformAnalytics(userId, platformId, {
      startDate: startDate ? new Date(startDate).getTime() : null,
      endDate: endDate ? new Date(endDate).getTime() : null,
    });
    
    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// OAuth helper functions moved to oauthService.js

module.exports = router;
