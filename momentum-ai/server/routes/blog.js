const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { verifyFirebaseToken } = require('../middleware/auth');
const admin = require('../firebaseAdmin');

/**
 * Post to WordPress
 * POST /api/blog/wordpress
 */
router.post('/wordpress', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, content, categories, tags, featuredImage, status = 'publish' } = req.body;
    
    const wpConfig = await getWordPressConfig(userId);
    if (!wpConfig) {
      return res.status(400).json({
        success: false,
        error: 'WordPress not configured. Please configure your WordPress credentials in settings.',
      });
    }
    
    const result = await postToWordPress(wpConfig, {
      title,
      content,
      categories,
      tags,
      featuredImage,
      status,
    });
    
    res.json({
      success: true,
      post: result,
    });
  } catch (error) {
    logger.error(`WordPress post error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to post to WordPress. Please try again.',
    });
  }
});

/**
 * Post to Medium
 * POST /api/blog/medium
 */
router.post('/medium', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, content, tags, publishStatus = 'draft' } = req.body;
    
    const tokens = await getMediumTokens(userId);
    if (!tokens) {
      return res.status(400).json({
        success: false,
        error: 'Medium not configured. Please connect your Medium account in settings.',
      });
    }
    
    const result = await postToMedium(tokens, {
      title,
      content,
      tags,
      publishStatus,
    });
    
    res.json({
      success: true,
      post: result,
    });
  } catch (error) {
    logger.error(`Medium post error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to post to Medium. Please try again.',
    });
  }
});

/**
 * Post to Substack
 * POST /api/blog/substack
 */
router.post('/substack', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, body, subtitle, sendEmail = false } = req.body;
    
    const tokens = await getSubstackTokens(userId);
    if (!tokens) {
      return res.status(400).json({
        success: false,
        error: 'Substack not configured. Please connect your Substack account in settings.',
      });
    }
    
    const result = await postToSubstack(tokens, {
      title,
      body,
      subtitle,
      sendEmail,
    });
    
    res.json({
      success: true,
      post: result,
    });
  } catch (error) {
    logger.error(`Substack post error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to post to Substack. Please try again.',
    });
  }
});

/**
 * Post to Ghost
 * POST /api/blog/ghost
 */
router.post('/ghost', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, html, tags, featured, status = 'published' } = req.body;
    
    const ghostConfig = await getGhostConfig(userId);
    if (!ghostConfig) {
      return res.status(400).json({
        success: false,
        error: 'Ghost not configured. Please configure your Ghost credentials in settings.',
      });
    }
    
    const result = await postToGhost(ghostConfig, {
      title,
      html,
      tags,
      featured,
      status,
    });
    
    res.json({
      success: true,
      post: result,
    });
  } catch (error) {
    logger.error(`Ghost post error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper functions

async function getWordPressConfig(userId) {
  // Get WordPress site URL, username, application password from Firestore
  logger.info(`Getting WordPress config for user: ${userId}`);
  try {
    const db = admin.firestore();
    const configDoc = await db.collection('blogConfigs').doc(userId).get();
    
    if (!configDoc.exists) {
      return null;
    }
    
    const data = configDoc.data();
    const wpConfig = data.wordpress;
    
    if (!wpConfig || !wpConfig.siteUrl || !wpConfig.username || !wpConfig.appPassword) {
      return null;
    }
    
    return {
      siteUrl: wpConfig.siteUrl,
      username: wpConfig.username,
      appPassword: wpConfig.appPassword,
    };
  } catch (error) {
    logger.error(`Error getting WordPress config for user ${userId}:`, error);
    return null;
  }
}

async function postToWordPress(config, { title, content, categories, tags, featuredImage, status }) {
  const axios = require('axios');
  
  const url = `${config.siteUrl}/wp-json/wp/v2/posts`;
  const auth = Buffer.from(`${config.username}:${config.appPassword}`).toString('base64');
  
  const postData = {
    title,
    content,
    status,
    categories: categories || [],
    tags: tags || [],
  };
  
  if (featuredImage) {
    postData.featured_media = featuredImage;
  }
  
  const response = await axios.post(url, postData, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.data;
}

async function getMediumTokens(userId) {
  logger.info(`Getting Medium tokens for user: ${userId}`);
  try {
    const db = admin.firestore();
    const configDoc = await db.collection('blogConfigs').doc(userId).get();
    
    if (!configDoc.exists) {
      return null;
    }
    
    const data = configDoc.data();
    const mediumTokens = data.medium;
    
    if (!mediumTokens || !mediumTokens.accessToken) {
      return null;
    }
    
    return {
      accessToken: mediumTokens.accessToken,
      refreshToken: mediumTokens.refreshToken,
    };
  } catch (error) {
    logger.error(`Error getting Medium tokens for user ${userId}:`, error);
    return null;
  }
}

async function postToMedium(tokens, { title, content, tags, publishStatus }) {
  const axios = require('axios');
  
  // Get user ID first
  const userResponse = await axios.get('https://api.medium.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
  
  const userId = userResponse.data.data.id;
  
  // Create post
  const postData = {
    title,
    contentFormat: 'html',
    content,
    tags,
    publishStatus,
  };
  
  const response = await axios.post(
    `https://api.medium.com/v1/users/${userId}/posts`,
    postData,
    {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data.data;
}

async function getSubstackTokens(userId) {
  logger.info(`Getting Substack tokens for user: ${userId}`);
  try {
    const db = admin.firestore();
    const configDoc = await db.collection('blogConfigs').doc(userId).get();
    
    if (!configDoc.exists) {
      return null;
    }
    
    const data = configDoc.data();
    const substackTokens = data.substack;
    
    if (!substackTokens || !substackTokens.accessToken) {
      return null;
    }
    
    return {
      accessToken: substackTokens.accessToken,
      refreshToken: substackTokens.refreshToken,
    };
  } catch (error) {
    logger.error(`Error getting Substack tokens for user ${userId}:`, error);
    return null;
  }
}

async function postToSubstack(tokens, { title, body, subtitle, sendEmail }) {
  const axios = require('axios');
  
  // Substack uses their API to create posts
  const response = await axios.post(
    'https://substack.com/api/v1/posts',
    {
      title,
      body,
      subtitle,
      send_email: sendEmail,
    },
    {
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
}

async function getGhostConfig(userId) {
  logger.info(`Getting Ghost config for user: ${userId}`);
  try {
    const db = admin.firestore();
    const configDoc = await db.collection('blogConfigs').doc(userId).get();
    
    if (!configDoc.exists) {
      return null;
    }
    
    const data = configDoc.data();
    const ghostConfig = data.ghost;
    
    if (!ghostConfig || !ghostConfig.ghostUrl || !ghostConfig.apiKey) {
      return null;
    }
    
    return {
      ghostUrl: ghostConfig.ghostUrl,
      apiKey: ghostConfig.apiKey,
    };
  } catch (error) {
    logger.error(`Error getting Ghost config for user ${userId}:`, error);
    return null;
  }
}

async function postToGhost(config, { title, html, tags, featured, status }) {
  const axios = require('axios');
  
  // Ghost Admin API
  const url = `${config.ghostUrl}/ghost/api/admin/posts/`;
  const auth = Buffer.from(`${config.apiKey}`).toString('base64');
  
  const postData = {
    posts: [{
      title,
      html,
      tags: tags || [],
      featured: featured || false,
      status,
    }],
  };
  
  const response = await axios.post(url, postData, {
    headers: {
      'Authorization': `Ghost ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.data.posts[0];
}

module.exports = router;

