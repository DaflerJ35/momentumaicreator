const admin = require('../firebaseAdmin');
const logger = require('../utils/logger');
const { getDatabase } = require('firebase-admin/database');

/**
 * Platform Service - Handles all platform-related database operations
 */

/**
 * Store platform tokens for a user
 */
async function storePlatformTokens(userId, platformId, tokens) {
  try {
    const db = getDatabase();
    const tokensRef = db.ref(`users/${userId}/platforms/${platformId}`);
    
    await tokensRef.set({
      ...tokens,
      connectedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    logger.info(`Stored tokens for ${platformId}, user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error storing platform tokens: ${error.message}`);
    throw error;
  }
}

/**
 * Get platform tokens for a user
 */
async function getPlatformTokens(userId, platformId) {
  try {
    const db = getDatabase();
    const tokensRef = db.ref(`users/${userId}/platforms/${platformId}`);
    const snapshot = await tokensRef.once('value');
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.val();
    
    // Check if token is expired
    if (data.expiresAt && data.expiresAt < Date.now()) {
      // Token expired, try to refresh
      if (data.refreshToken) {
        return await refreshPlatformToken(userId, platformId, data.refreshToken);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error(`Error getting platform tokens: ${error.message}`);
    return null;
  }
}

/**
 * Get all connected platforms for a user
 */
async function getConnectedPlatforms(userId) {
  try {
    const db = getDatabase();
    const platformsRef = db.ref(`users/${userId}/platforms`);
    const snapshot = await platformsRef.once('value');
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const platforms = snapshot.val();
    return Object.keys(platforms).map(platformId => ({
      platformId,
      ...platforms[platformId],
    }));
  } catch (error) {
    logger.error(`Error getting connected platforms: ${error.message}`);
    return [];
  }
}

/**
 * Disconnect a platform
 */
async function disconnectPlatform(userId, platformId) {
  try {
    const db = getDatabase();
    const tokensRef = db.ref(`users/${userId}/platforms/${platformId}`);
    await tokensRef.remove();
    
    logger.info(`Disconnected ${platformId} for user: ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error disconnecting platform: ${error.message}`);
    throw error;
  }
}

/**
 * Refresh platform token
 */
async function refreshPlatformToken(userId, platformId, refreshToken) {
  try {
    // Platform-specific token refresh logic
    // This is a placeholder - implement actual refresh for each platform
    logger.info(`Refreshing token for ${platformId}, user: ${userId}`);
    
    // For now, return null (token refresh needs platform-specific implementation)
    return null;
  } catch (error) {
    logger.error(`Error refreshing platform token: ${error.message}`);
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
  storePostAnalytics,
  getPlatformAnalytics,
};

