const admin = require('../firebaseAdmin');
const logger = require('../utils/logger');
const { getDatabase } = require('firebase-admin/database');
const tokenStorage = require('./tokenStorage');

/**
 * Platform Service - Handles all platform-related database operations
 */

/**
 * Store platform tokens for a user (secure, encrypted storage)
 */
async function storePlatformTokens(userId, platformId, tokens) {
  return await tokenStorage.storePlatformTokens(userId, platformId, tokens);
}

/**
 * Get platform tokens for a user (from secure storage)
 */
async function getPlatformTokens(userId, platformId) {
  try {
    const tokens = await tokenStorage.getPlatformTokens(userId, platformId);
    
    if (!tokens) {
      return null;
    }
    
    // Check if token is expired
    if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
      // Token expired, try to refresh
      // For Instagram/Facebook, use accessToken for refresh (fb_exchange_token)
      if (platformId === 'instagram' || platformId === 'facebook') {
        const newTokens = await refreshPlatformToken(userId, platformId, tokens.accessToken);
        if (newTokens) {
          return newTokens;
        }
      } else if (tokens.refreshToken) {
        const newTokens = await refreshPlatformToken(userId, platformId, tokens.refreshToken);
        if (newTokens) {
          return newTokens;
        }
      }
      // If refresh fails, still return expired tokens (caller can handle)
      return tokens;
    }
    
    return tokens;
  } catch (error) {
    logger.error(`Error getting platform tokens: ${error.message}`);
    return null;
  }
}

/**
 * Get all connected platforms for a user (from secure storage)
 */
async function getConnectedPlatforms(userId) {
  return await tokenStorage.getConnectedPlatforms(userId);
}

/**
 * Disconnect a platform (remove from secure storage)
 */
async function disconnectPlatform(userId, platformId) {
  return await tokenStorage.disconnectPlatform(userId, platformId);
}

/**
 * Refresh platform token
 */
async function refreshPlatformToken(userId, platformId, refreshToken) {
  try {
    logger.info(`Refreshing token for ${platformId}, user: ${userId}`);
    
    const axios = require('axios');
    let newTokens = null;
    
    switch (platformId) {
      case 'twitter': {
        const response = await axios.post(
          'https://api.twitter.com/2/oauth2/token',
          new URLSearchParams({
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            client_id: process.env.TWITTER_CLIENT_ID,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        newTokens = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || refreshToken,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
          scope: response.data.scope,
        };
        break;
      }
      
      case 'linkedin': {
        const response = await axios.post(
          'https://www.linkedin.com/oauth/v2/accessToken',
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        newTokens = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || refreshToken,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
          scope: response.data.scope,
        };
        break;
      }
      
      case 'youtube': {
        const response = await axios.post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        newTokens = {
          accessToken: response.data.access_token,
          refreshToken: refreshToken, // Google doesn't return new refresh token
          expiresAt: Date.now() + (response.data.expires_in * 1000),
          scope: response.data.scope,
        };
        break;
      }
      
      case 'facebook': {
        // Facebook tokens are long-lived, but can be refreshed
        // Parameter is currentAccessToken used as fb_exchange_token
        const currentAccessToken = refreshToken; // refreshToken parameter is actually the current access token for Facebook
        const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fb_exchange_token: currentAccessToken,
          },
        });
        
        newTokens = {
          accessToken: response.data.access_token,
          expiresAt: Date.now() + (response.data.expires_in * 1000),
        };
        break;
      }
      
      case 'tiktok': {
        const response = await axios.post(
          'https://open.tiktokapis.com/v2/oauth/token/',
          new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        newTokens = {
          accessToken: response.data.data.access_token,
          refreshToken: response.data.data.refresh_token || refreshToken,
          expiresAt: Date.now() + (response.data.data.expires_in * 1000),
          scope: response.data.data.scope,
        };
        break;
      }
      
      case 'instagram': {
        // Instagram Graph API uses Facebook token refresh
        // Get current tokens to preserve pageAccessToken and igUserId
        const currentTokens = await tokenStorage.getPlatformTokens(userId, platformId);
        
        // Refresh user access token using Facebook exchange
        // Parameter is currentAccessToken used as fb_exchange_token
        const currentAccessToken = refreshToken; // refreshToken parameter is actually the current access token for Instagram
        const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fb_exchange_token: currentAccessToken,
          },
        });
        
        const newUserAccessToken = tokenResponse.data.access_token;
        
        // Refresh Page access token if we have a page token
        let newPageAccessToken = currentTokens?.pageAccessToken;
        if (currentTokens?.pageAccessToken) {
          try {
            // Get long-lived page token
            const pageTokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
              params: {
                grant_type: 'fb_exchange_token',
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                fb_exchange_token: currentTokens.pageAccessToken,
              },
            });
            newPageAccessToken = pageTokenResponse.data.access_token;
          } catch (error) {
            logger.warn('Failed to refresh page token, using existing:', error.message);
          }
        }
        
        const expiresIn = tokenResponse.data.expires_in || (60 * 24 * 60 * 60); // Default 60 days
        
        newTokens = {
          accessToken: newUserAccessToken,
          pageAccessToken: newPageAccessToken,
          igUserId: currentTokens?.igUserId, // Preserve Instagram user ID
          expiresAt: Date.now() + (expiresIn * 1000),
          scope: tokenResponse.data.scope || currentTokens?.scope,
        };
        break;
      }
      
      default:
        logger.warn(`Token refresh not implemented for ${platformId}`);
        return null;
    }
    
    if (newTokens) {
      // Update stored tokens
      await tokenStorage.updatePlatformTokens(userId, platformId, newTokens);
      logger.info(`Successfully refreshed token for ${platformId}, user: ${userId}`);
      return newTokens;
    }
    
    return null;
  } catch (error) {
    logger.error(`Error refreshing platform token: ${error.message}`, {
      platformId,
      userId,
      error: error.response?.data || error.stack,
    });
    return null;
  }
}

/**
 * Store scheduled post
 */
async function storeScheduledPost(userId, postData) {
  try {
    const db = getDatabase();
    const postsRef = db.ref(`users/${userId}/scheduledPosts`);
    const newPostRef = postsRef.push();
    
    await newPostRef.set({
      ...postData,
      createdAt: Date.now(),
      status: 'scheduled',
    });
    
    const postId = newPostRef.key;
    logger.info(`Stored scheduled post ${postId} for user: ${userId}`);
    
    return postId;
  } catch (error) {
    logger.error(`Error storing scheduled post: ${error.message}`);
    throw error;
  }
}

/**
 * Get scheduled posts for a user
 */
async function getScheduledPosts(userId, limit = 50) {
  try {
    const db = getDatabase();
    const postsRef = db.ref(`users/${userId}/scheduledPosts`);
    const snapshot = await postsRef
      .orderByChild('scheduleTime')
      .limitToLast(limit)
      .once('value');
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const posts = snapshot.val();
    return Object.entries(posts).map(([id, data]) => ({
      id,
      ...data,
    })).sort((a, b) => (b.scheduleTime || 0) - (a.scheduleTime || 0));
  } catch (error) {
    logger.error(`Error getting scheduled posts: ${error.message}`);
    return [];
  }
}

/**
 * Update scheduled post status
 */
async function updateScheduledPostStatus(userId, postId, status, result = null) {
  try {
    const db = getDatabase();
    const postRef = db.ref(`users/${userId}/scheduledPosts/${postId}`);
    
    const updates = {
      status,
      updatedAt: Date.now(),
    };
    
    if (result) {
      updates.result = result;
    }
    
    if (status === 'published') {
      updates.publishedAt = Date.now();
    }
    
    await postRef.update(updates);
    return true;
  } catch (error) {
    logger.error(`Error updating scheduled post status: ${error.message}`);
    throw error;
  }
}

/**
 * Delete scheduled post
 */
async function deleteScheduledPost(userId, postId) {
  try {
    const db = getDatabase();
    const postRef = db.ref(`users/${userId}/scheduledPosts/${postId}`);
    
    // Verify post exists and belongs to user
    const snapshot = await postRef.once('value');
    if (!snapshot.exists()) {
      throw new Error('Scheduled post not found');
    }
    
    await postRef.remove();
    logger.info(`Deleted scheduled post ${postId} for user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting scheduled post: ${error.message}`);
    throw error;
  }
}

/**
 * Store post analytics
 */
async function storePostAnalytics(userId, platformId, postId, analytics) {
  try {
    const db = getDatabase();
    const analyticsRef = db.ref(`users/${userId}/analytics/${platformId}/posts/${postId}`);
    
    await analyticsRef.set({
      ...analytics,
      timestamp: Date.now(),
    });
    
    return true;
  } catch (error) {
    logger.error(`Error storing post analytics: ${error.message}`);
    throw error;
  }
}

/**
 * Get platform analytics
 */
async function getPlatformAnalytics(userId, platformId, { startDate, endDate }) {
  try {
    const db = getDatabase();
    const analyticsRef = db.ref(`users/${userId}/analytics/${platformId}/posts`);
    const snapshot = await analyticsRef.once('value');
    
    if (!snapshot.exists()) {
      return {
        impressions: 0,
        engagements: 0,
        reach: 0,
        clicks: 0,
        posts: 0,
      };
    }
    
    const posts = snapshot.val();
    const filteredPosts = Object.values(posts).filter(post => {
      const postDate = post.timestamp;
      if (startDate && postDate < startDate) return false;
      if (endDate && postDate > endDate) return false;
      return true;
    });
    
    const analytics = filteredPosts.reduce((acc, post) => {
      acc.impressions += post.impressions || 0;
      acc.engagements += post.engagements || 0;
      acc.reach += post.reach || 0;
      acc.clicks += post.clicks || 0;
      acc.posts += 1;
      return acc;
    }, {
      impressions: 0,
      engagements: 0,
      reach: 0,
      clicks: 0,
      posts: 0,
    });
    
    return analytics;
  } catch (error) {
    logger.error(`Error getting platform analytics: ${error.message}`);
    return {
      impressions: 0,
      engagements: 0,
      reach: 0,
      clicks: 0,
      posts: 0,
    };
  }
}

module.exports = {
  storePlatformTokens,
  getPlatformTokens,
  getConnectedPlatforms,
  disconnectPlatform,
  refreshPlatformToken,
  storeScheduledPost,
  getScheduledPosts,
  updateScheduledPostStatus,
  deleteScheduledPost,
  storePostAnalytics,
  getPlatformAnalytics,
};

