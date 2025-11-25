const logger = require('../utils/logger');
const platformService = require('./platformService');
const postingService = require('./platformPostingService');
const { getDatabase } = require('firebase-admin/database');

/**
 * Scheduler Service - Processes scheduled posts
 */

let schedulerInterval = null;

/**
 * Start the scheduler
 */
function startScheduler() {
  if (schedulerInterval) {
    logger.warn('Scheduler already running');
    return;
  }

  // Check for scheduled posts every minute
  schedulerInterval = setInterval(async () => {
    try {
      await processScheduledPosts();
    } catch (error) {
      logger.error(`Scheduler error: ${error.message}`);
    }
  }, 60000); // Every minute

  logger.info('Scheduler started');
}

/**
 * Stop the scheduler
 */
function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('Scheduler stopped');
  }
}

/**
 * Process scheduled posts that are due
 */
async function processScheduledPosts() {
  try {
    // Check if Firebase is initialized before attempting to access database
    const admin = require('../firebaseAdmin');
    if (typeof admin.isInitialized === 'function' && !admin.isInitialized()) {
      // Silent return or debug log to avoid spamming errors when Firebase isn't configured
      // This is expected behavior in dev environments without credentials
      return;
    }

    const db = getDatabase();
    const usersRef = db.ref('users');
    const usersSnapshot = await usersRef.once('value');

    if (!usersSnapshot.exists()) {
      return;
    }

    const users = usersSnapshot.val();
    const now = Date.now();

    // Process each user's scheduled posts
    for (const [userId, userData] of Object.entries(users)) {
      if (!userData.scheduledPosts) {
        continue;
      }

      const scheduledPosts = userData.scheduledPosts;

      for (const [postId, postData] of Object.entries(scheduledPosts)) {
        // Skip if already processed or cancelled
        if (postData.status !== 'scheduled') {
          continue;
        }

        // Check if it's time to post
        const scheduleTime = postData.scheduleTime;
        if (!scheduleTime || scheduleTime > now) {
          continue;
        }

        // Post is due - publish it
        try {
          logger.info(`Publishing scheduled post ${postId} for user ${userId}`);

          const result = await postingService.postToPlatform(
            postData.platformId,
            userId,
            {
              content: postData.content,
              media: postData.media,
              options: postData.options || {},
            }
          );

          // Update post status
          await platformService.updateScheduledPostStatus(userId, postId, 'published', result);

          // Store analytics
          await platformService.storePostAnalytics(userId, postData.platformId, result.postId, {
            impressions: 0,
            engagements: 0,
            reach: 0,
            clicks: 0,
          });

          logger.info(`Successfully published scheduled post ${postId}`);
        } catch (error) {
          logger.error(`Error publishing scheduled post ${postId}: ${error.message}`, {
            error: error.stack,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
          });

          // Update post status to failed with detailed error info
          await platformService.updateScheduledPostStatus(userId, postId, 'failed', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            timestamp: Date.now(),
          });
        }
      }
    }
  } catch (error) {
    logger.error(`Error processing scheduled posts: ${error.message}`);
  }
}

/**
 * Get upcoming scheduled posts for a user
 */
async function getUpcomingPosts(userId, limit = 10) {
  try {
    const posts = await platformService.getScheduledPosts(userId, limit);
    const now = Date.now();

    return posts.filter(post =>
      post.status === 'scheduled' &&
      post.scheduleTime &&
      post.scheduleTime > now
    ).sort((a, b) => a.scheduleTime - b.scheduleTime);
  } catch (error) {
    logger.error(`Error getting upcoming posts: ${error.message}`);
    return [];
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  processScheduledPosts,
  getUpcomingPosts,
};

