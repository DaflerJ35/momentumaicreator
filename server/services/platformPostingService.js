const axios = require('axios');
const logger = require('../utils/logger');
const { getPlatformTokens } = require('./platformService');

/**
 * Platform Posting Service - Handles actual posting to each platform
 */

/**
 * Post to Instagram
 */
async function postToInstagram(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'instagram');
    if (!tokens) {
      throw new Error('Instagram not connected');
    }
    
    // Instagram Graph API
    const response = await axios.post(
      `https://graph.instagram.com/me/media`,
      {
        image_url: media?.[0]?.url,
        caption: content,
        access_token: tokens.accessToken,
      }
    );
    
    return {
      postId: response.data.id,
      url: `https://www.instagram.com/p/${response.data.id}`,
    };
  } catch (error) {
    logger.error(`Instagram post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'twitter');
    if (!tokens) {
      throw new Error('Twitter not connected');
    }
    
    // Twitter API v2
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: content.substring(0, 280), // Twitter character limit
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      postId: response.data.data.id,
      url: `https://twitter.com/i/web/status/${response.data.data.id}`,
    };
  } catch (error) {
    logger.error(`Twitter post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'linkedin');
    if (!tokens) {
      throw new Error('LinkedIn not connected');
    }
    
    // Get user profile first
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/me',
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      }
    );
    
    const personId = profileResponse.data.id;
    
    // Create post
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );
    
    return {
      postId: response.data.id,
      url: `https://www.linkedin.com/feed/update/${response.data.id}`,
    };
  } catch (error) {
    logger.error(`LinkedIn post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to Facebook
 */
async function postToFacebook(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'facebook');
    if (!tokens) {
      throw new Error('Facebook not connected');
    }
    
    const pageId = options.pageId || 'me';
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        message: content,
        access_token: tokens.accessToken,
      }
    );
    
    return {
      postId: response.data.id,
      url: `https://www.facebook.com/${response.data.id}`,
    };
  } catch (error) {
    logger.error(`Facebook post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to TikTok
 */
async function postToTikTok(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'tiktok');
    if (!tokens) {
      throw new Error('TikTok not connected');
    }
    
    // TikTok Business API
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/',
      {
        post_info: {
          title: content.substring(0, 150),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: media?.[0]?.size || 0,
          chunk_size: 10000000,
          total_chunk_count: 1,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      postId: response.data.data.publish_id,
      uploadUrl: response.data.data.upload_url,
    };
  } catch (error) {
    logger.error(`TikTok post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to OnlyFans (Custom API)
 */
async function postToOnlyFans(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'onlyfans');
    if (!tokens) {
      throw new Error('OnlyFans not connected');
    }
    
    // OnlyFans uses custom API - this is a placeholder structure
    // In production, implement actual OnlyFans API integration
    const response = await axios.post(
      'https://onlyfans.com/api2/v2/posts',
      {
        text: content,
        photos: media?.map(m => m.url) || [],
        price: options.price || 0,
        canPurchase: options.canPurchase || false,
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      postId: response.data.id,
      url: `https://onlyfans.com/posts/${response.data.id}`,
    };
  } catch (error) {
    logger.error(`OnlyFans post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to Fansly (Custom API)
 */
async function postToFansly(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'fansly');
    if (!tokens) {
      throw new Error('Fansly not connected');
    }
    
    // Fansly API integration
    const response = await axios.post(
      'https://api.fansly.com/api/v1/post',
      {
        content: content,
        attachments: media?.map(m => m.id) || [],
        tierIds: options.tierIds || [],
        price: options.price || 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      postId: response.data.postId,
      url: `https://fansly.com/post/${response.data.postId}`,
    };
  } catch (error) {
    logger.error(`Fansly post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to Fanvue (Custom API)
 */
async function postToFanvue(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'fanvue');
    if (!tokens) {
      throw new Error('Fanvue not connected');
    }
    
    const response = await axios.post(
      'https://api.fanvue.com/v1/posts',
      {
        text: content,
        media: media?.map(m => m.url) || [],
        price: options.price || 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      postId: response.data.id,
      url: `https://fanvue.com/posts/${response.data.id}`,
    };
  } catch (error) {
    logger.error(`Fanvue post error: ${error.message}`);
    throw error;
  }
}

/**
 * Post to Fanplace (Custom API)
 */
async function postToFanplace(userId, { content, media, options }) {
  try {
    const tokens = await getPlatformTokens(userId, 'fanplace');
    if (!tokens) {
      throw new Error('Fanplace not connected');
    }
    
    const response = await axios.post(
      'https://api.fanplace.com/v1/posts',
      {
        content: content,
        attachments: media || [],
        price: options.price || 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return {
      postId: response.data.id,
      url: `https://fanplace.com/posts/${response.data.id}`,
    };
  } catch (error) {
    logger.error(`Fanplace post error: ${error.message}`);
    throw error;
  }
}

/**
 * Main posting function - routes to platform-specific handlers
 */
async function postToPlatform(platformId, userId, { content, media, scheduleTime, options }) {
  const postingFunctions = {
    instagram: postToInstagram,
    twitter: postToTwitter,
    linkedin: postToLinkedIn,
    facebook: postToFacebook,
    tiktok: postToTikTok,
    onlyfans: postToOnlyFans,
    fansly: postToFansly,
    fanvue: postToFanvue,
    fanplace: postToFanplace,
    // Add more platforms as needed
  };
  
  const postFunction = postingFunctions[platformId];
  if (!postFunction) {
    throw new Error(`Posting not implemented for platform: ${platformId}`);
  }
  
  return await postFunction(userId, { content, media, options });
}

module.exports = {
  postToPlatform,
  postToInstagram,
  postToTwitter,
  postToLinkedIn,
  postToFacebook,
  postToTikTok,
  postToOnlyFans,
  postToFansly,
  postToFanvue,
  postToFanplace,
};

