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
    const oauthUrl = await getOAuthUrl(platformId, userId, stateId, pkce?.codeChallenge);
    
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
    const tokens = await exchangeOAuthCode(platformId, code, stateData.codeVerifier, correlationId);
    
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

async function getOAuthUrl(platformId, userId, stateId, codeChallenge) {
  // Platform-specific OAuth URLs
  const oauthConfigs = {
    instagram: {
      url: 'https://www.facebook.com/v18.0/dialog/oauth',
      clientId: process.env.FACEBOOK_APP_ID,
      redirectUri: `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/instagram/oauth/callback`,
      scope: 'instagram_basic,pages_show_list,instagram_content_publish,pages_read_engagement',
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
    state: stateId,
  });
  
  // Add PKCE params if code_challenge provided
  if (codeChallenge) {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }
  
  return `${config.url}?${params.toString()}`;
}

async function exchangeOAuthCode(platformId, code, codeVerifier, correlationId) {
  logger.info(`Exchanging OAuth code for ${platformId}`, { correlationId });
  
  const axios = require('axios');
  const redirectUri = `${process.env.API_URL || 'http://localhost:3001'}/api/platforms/${platformId}/oauth/callback`;
  
  try {
    switch (platformId) {
      case 'instagram': {
        // Exchange code for Facebook access token
        const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
          params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: redirectUri,
            code,
          },
        });
        
        const userAccessToken = tokenResponse.data.access_token;
        
        // Fetch user's pages to get Page access token and Instagram Business Account ID
        const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
          params: {
            access_token: userAccessToken,
            fields: 'access_token,instagram_business_account',
          },
        });
        
        // Find page with Instagram Business Account
        const pageWithIG = pagesResponse.data.data.find(page => page.instagram_business_account);
        if (!pageWithIG || !pageWithIG.instagram_business_account) {
          throw new Error('No Instagram Business Account found. Please connect a Facebook Page with an Instagram Business Account.');
        }
        
        const pageAccessToken = pageWithIG.access_token;
        const igUserId = pageWithIG.instagram_business_account.id;
        
        // Get token expiry (Facebook tokens typically last 60 days)
        const expiresIn = tokenResponse.data.expires_in || (60 * 24 * 60 * 60); // Default 60 days in seconds
        
        return {
          accessToken: userAccessToken,
          pageAccessToken: pageAccessToken,
          igUserId: igUserId,
          expiresAt: Date.now() + (expiresIn * 1000),
          scope: tokenResponse.data.scope || 'instagram_basic,pages_show_list,instagram_content_publish,pages_read_engagement',
        };
      }
      
      case 'twitter': {
        // Twitter OAuth 2.0 with PKCE - no Basic auth, use client_id in body
        const response = await axios.post(
          'https://api.twitter.com/2/oauth2/token',
          new URLSearchParams({
            code,
            grant_type: 'authorization_code',
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
          scope: response.data.scope,
        };
      }
      
      case 'linkedin': {
        const response = await axios.post(
          'https://www.linkedin.com/oauth/v2/accessToken',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            code_verifier: codeVerifier,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
          scope: response.data.scope,
        };
      }
      
      case 'facebook': {
        const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
          params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: redirectUri,
            code,
          },
        });
        
        return {
          accessToken: response.data.access_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
        };
      }
      
      case 'youtube': {
        const response = await axios.post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        return {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
          scope: response.data.scope,
        };
      }
      
      case 'tiktok': {
        const response = await axios.post(
          'https://open.tiktokapis.com/v2/oauth/token/',
          new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        return {
          accessToken: response.data.data.access_token,
          refreshToken: response.data.data.refresh_token,
          expiresAt: Date.now() + (response.data.data.expires_in * 1000),
          scope: response.data.data.scope,
        };
      }
      
      // Add more platform OAuth exchanges here
      default:
        logger.error(`OAuth exchange not implemented for ${platformId}`, { correlationId });
        throw new Error(`OAuth exchange not yet implemented for platform: ${platformId}. This platform is coming soon.`);
    }
  } catch (error) {
    logger.error(`OAuth token exchange error for ${platformId}: ${error.message}`, { 
      correlationId,
      error: error.response?.data || error.stack 
    });
    throw error;
  }
}

module.exports = router;
