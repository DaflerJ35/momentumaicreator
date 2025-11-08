const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { verifyFirebaseToken } = require('../middleware/auth');
const platformService = require('../services/platformService');
const postingService = require('../services/platformPostingService');

// Platform OAuth and API integrations
// This handles ALL platforms: OnlyFans, Fansly, Fanvue, Fanplace, Instagram, Twitter, etc.

/**
 * Initialize OAuth flow for a platform
 * GET /api/platforms/:platformId/oauth/init
 */
router.get('/:platformId/oauth/init', verifyFirebaseToken, async (req, res) => {
  try {
    const { platformId } = req.params;
    const userId = req.user.uid;
    
    logger.info(`OAuth init for platform: ${platformId}, user: ${userId}`);
    
    // Generate OAuth URL based on platform
    const oauthUrl = await getOAuthUrl(platformId, userId);
    
    res.json({
      success: true,
      oauthUrl,
      platformId,
    });
  } catch (error) {
    logger.error(`OAuth init error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * OAuth callback handler
 * GET /api/platforms/:platformId/oauth/callback
 * Note: This route doesn't use verifyFirebaseToken because OAuth callbacks come from external services
 */
router.get('/:platformId/oauth/callback', async (req, res) => {
  try {
    const { platformId } = req.params;
    const { code, state, error } = req.query;
    
    if (error) {
      logger.error(`OAuth error from ${platformId}: ${error}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=${encodeURIComponent(error)}`);
    }
    
    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=missing_code_or_state`);
    }
    
    // Parse state to get userId
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      logger.error(`Invalid state parameter: ${e.message}`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=invalid_state`);
    }
    
    const userId = stateData.userId;
    if (!userId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=missing_user_id`);
    }
    
    logger.info(`OAuth callback for platform: ${platformId}, user: ${userId}`);
    
    // Exchange code for access token
    const tokens = await exchangeOAuthCode(platformId, code, state);
    
    // Store tokens securely in Firebase
    await platformService.storePlatformTokens(userId, platformId, tokens);
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?connected=${platformId}`);
  } catch (error) {
    logger.error(`OAuth callback error: ${error.message}`);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/integrations?error=${encodeURIComponent(error.message)}`);
  }
});

/**
 * Get connected platforms for user
 * GET /api/platforms/connected
 */
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

// Helper functions

async function getOAuthUrl(platformId, userId) {
  const state = Buffer.from(JSON.stringify({ userId, platformId })).toString('base64');
  
  // Platform-specific OAuth URLs
  const oauthConfigs = {
    instagram: {
      url: 'https://api.instagram.com/oauth/authorize',
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/instagram/oauth/callback`,
      scope: 'user_profile,user_media',
    },
    twitter: {
      url: 'https://twitter.com/i/oauth2/authorize',
      clientId: process.env.TWITTER_CLIENT_ID,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/twitter/oauth/callback`,
      scope: 'tweet.read tweet.write users.read offline.access',
    },
    youtube: {
      url: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/youtube/oauth/callback`,
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    },
    linkedin: {
      url: 'https://www.linkedin.com/oauth/v2/authorization',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/linkedin/oauth/callback`,
      scope: 'r_liteprofile r_emailaddress w_member_social',
    },
    facebook: {
      url: 'https://www.facebook.com/v18.0/dialog/oauth',
      clientId: process.env.FACEBOOK_APP_ID,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/facebook/oauth/callback`,
      scope: 'pages_manage_posts,pages_read_engagement',
    },
    tiktok: {
      url: 'https://www.tiktok.com/v2/auth/authorize',
      clientId: process.env.TIKTOK_CLIENT_KEY,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/tiktok/oauth/callback`,
      scope: 'user.info.basic,video.upload',
    },
    // Subscription platforms (custom OAuth flows)
    onlyfans: {
      url: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/onlyfans/oauth/init`,
      // OnlyFans uses custom API authentication
    },
    fansly: {
      url: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/fansly/oauth/init`,
    },
    fanvue: {
      url: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/fanvue/oauth/init`,
    },
    fanplace: {
      url: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/fanplace/oauth/init`,
    },
  };
  
  const config = oauthConfigs[platformId];
  if (!config) {
    throw new Error(`OAuth not configured for platform: ${platformId}`);
  }
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope || '',
    state,
  });
  
  return `${config.url}?${params.toString()}`;
}

async function exchangeOAuthCode(platformId, code, state) {
  logger.info(`Exchanging OAuth code for ${platformId}`);
  
  // Parse state to get userId
  const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
  const userId = stateData.userId;
  
  // Platform-specific token exchange
  const axios = require('axios');
  
  try {
    switch (platformId) {
      case 'instagram': {
        const response = await axios.post('https://api.instagram.com/oauth/access_token', {
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/instagram/oauth/callback`,
          code,
        });
        
        return {
          accessToken: response.data.access_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
        };
      }
      
      case 'twitter': {
        const credentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64');
        const response = await axios.post(
          'https://api.twitter.com/2/oauth2/token',
          new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/twitter/oauth/callback`,
            code_verifier: stateData.codeVerifier,
          }),
          {
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
        };
      }
      
      // Add more platform OAuth exchanges here
      default:
        // For platforms without OAuth or custom implementations
        return {
          accessToken: `token_${platformId}_${Date.now()}`,
          expiresAt: Date.now() + 3600000, // 1 hour default
        };
    }
  } catch (error) {
    logger.error(`OAuth token exchange error for ${platformId}: ${error.message}`);
    throw error;
  }
}

module.exports = router;
