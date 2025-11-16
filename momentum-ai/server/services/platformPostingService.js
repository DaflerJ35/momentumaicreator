const axios = require('axios');
const logger = require('../utils/logger');
const { getPlatformTokens, refreshPlatformToken } = require('./platformService');
const { updatePlatformTokens } = require('./tokenStorage');
const { isGraphTokenExpired } = require('../utils/graphAuth');
const { fetchPermalink } = require('../utils/graphPosts');
const crypto = require('crypto');

/**
 * Platform Posting Service - Handles actual posting to each platform
 */

/**
 * Retry utility with exponential backoff and jitter
 */
async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors (except 401/429)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        const status = error.response.status;
        // Retry on 401 (token refresh) and 429 (rate limit)
        if (status !== 401 && status !== 429) {
          throw error;
        }
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 0.3 * delay; // 30% jitter
      const totalDelay = delay + jitter;
      
      logger.warn(`Attempt ${attempt} failed, retrying in ${Math.round(totalDelay)}ms: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
}

/**
 * Generate idempotency key for a post
 */
function generateIdempotencyKey(platformId, userId, content) {
  const hash = crypto.createHash('sha256')
    .update(`${platformId}:${userId}:${content}:${Date.now()}`)
    .digest('hex')
    .substring(0, 32);
  return hash;
}

/**
 * Post to Instagram
 */
async function postToInstagram(userId, { content, media, options }) {
  return await retryWithBackoff(async () => {
    let tokens = await getPlatformTokens(userId, 'instagram');
    if (!tokens) {
      throw new Error('Instagram not connected');
    }
    
    if (!tokens.igUserId || !tokens.pageAccessToken) {
      throw new Error('Instagram Business Account not properly connected. Please reconnect your Instagram account.');
    }
    
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${tokens.igUserId}/media`,
        {
          image_url: media?.[0]?.url,
          caption: content,
          access_token: tokens.pageAccessToken,
        }
      );
      
      const creationId = containerResponse.data.id;
      
      // Step 2: Publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${tokens.igUserId}/media_publish`,
        {
          creation_id: creationId,
          access_token: tokens.pageAccessToken,
        }
      );
      
      const mediaId = publishResponse.data.id;
      
      // Fetch permalink for the published post
      const permalink = await fetchPermalink({
        id: mediaId,
        accessToken: tokens.pageAccessToken,
        platform: 'instagram',
      });
      
      return {
        postId: mediaId,
        url: permalink,
      };
    } catch (error) {
      // Handle token expiry using shared helper
      if (isGraphTokenExpired(error)) {
        logger.info('Instagram token expired, refreshing...');
        const newTokens = await refreshPlatformToken(userId, 'instagram', tokens.accessToken);
        if (newTokens && newTokens.pageAccessToken) {
          // Retry with new token
          const containerResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${newTokens.igUserId || tokens.igUserId}/media`,
            {
              image_url: media?.[0]?.url,
              caption: content,
              access_token: newTokens.pageAccessToken,
            }
          );
          
          const creationId = containerResponse.data.id;
          
          const publishResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${newTokens.igUserId || tokens.igUserId}/media_publish`,
            {
              creation_id: creationId,
              access_token: newTokens.pageAccessToken,
            }
          );
          
          const mediaId = publishResponse.data.id;
          
          // Fetch permalink for the published post
          const permalink = await fetchPermalink({
            id: mediaId,
            accessToken: newTokens.pageAccessToken,
            platform: 'instagram',
          });
          
          return {
            postId: mediaId,
            url: permalink,
          };
        }
      }
      throw error;
    }
  }, 3, 1000);
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(userId, { content, media, options }) {
  const idempotencyKey = generateIdempotencyKey('twitter', userId, content);
  
  return await retryWithBackoff(async () => {
    let tokens = await getPlatformTokens(userId, 'twitter');
    if (!tokens) {
      throw new Error('Twitter not connected');
    }
    
    try {
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
            'Idempotency-Key': idempotencyKey, // Twitter doesn't support this, but useful for logging
          },
        }
      );
      
      return {
        postId: response.data.data.id,
        url: `https://twitter.com/i/web/status/${response.data.data.id}`,
      };
    } catch (error) {
      // Handle 401 - token expired, try to refresh and retry once
      if (error.response?.status === 401 && tokens.refreshToken) {
        logger.info('Twitter token expired, refreshing...');
        const newTokens = await refreshPlatformToken(userId, 'twitter', tokens.refreshToken);
        if (newTokens) {
          // Retry with new token
          const retryResponse = await axios.post(
            'https://api.twitter.com/2/tweets',
            {
              text: content.substring(0, 280),
            },
            {
              headers: {
                'Authorization': `Bearer ${newTokens.accessToken}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': idempotencyKey,
              },
            }
          );
          return {
            postId: retryResponse.data.data.id,
            url: `https://twitter.com/i/web/status/${retryResponse.data.data.id}`,
          };
        }
      }
      throw error;
    }
  }, 3, 1000);
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(userId, { content, media, options }) {
  const idempotencyKey = generateIdempotencyKey('linkedin', userId, content);
  
  return await retryWithBackoff(async () => {
    let tokens = await getPlatformTokens(userId, 'linkedin');
    if (!tokens) {
      throw new Error('LinkedIn not connected');
    }
    
    try {
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
            'X-Idempotency-Key': idempotencyKey, // LinkedIn supports idempotency
          },
        }
      );
      
      return {
        postId: response.data.id,
        url: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      // Handle 401 - token expired
      if (error.response?.status === 401 && tokens.refreshToken) {
        logger.info('LinkedIn token expired, refreshing...');
        const newTokens = await refreshPlatformToken(userId, 'linkedin', tokens.refreshToken);
        if (newTokens) {
          // Retry with new token
          const retryProfileResponse = await axios.get(
            'https://api.linkedin.com/v2/me',
            {
              headers: {
                'Authorization': `Bearer ${newTokens.accessToken}`,
              },
            }
          );
          const personId = retryProfileResponse.data.id;
          const retryResponse = await axios.post(
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
                'Authorization': `Bearer ${newTokens.accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
                'X-Idempotency-Key': idempotencyKey,
              },
            }
          );
          return {
            postId: retryResponse.data.id,
            url: `https://www.linkedin.com/feed/update/${retryResponse.data.id}`,
          };
        }
      }
      throw error;
    }
  }, 3, 1000);
}

/**
 * Fetch page access token for a Facebook Page
 * @param {string} pageId - Facebook Page ID
 * @param {string} userAccessToken - User access token
 * @returns {Promise<string>} - Page access token
 */
async function fetchFacebookPageAccessToken(pageId, userAccessToken) {
  const response = await axios.get(
    `https://graph.facebook.com/v18.0/${pageId}`,
    {
      params: {
        fields: 'access_token',
        access_token: userAccessToken,
      },
    }
  );
  
  return response.data.access_token;
}

/**
 * Post to Facebook
 */
async function postToFacebook(userId, { content, media, options }) {
  return await retryWithBackoff(async () => {
    let tokens = await getPlatformTokens(userId, 'facebook');
    if (!tokens) {
      throw new Error('Facebook not connected');
    }
    
    const pageId = options.pageId || 'me';
    
    try {
      // If posting to a Page (not 'me'), fetch page access token
      let accessToken = tokens.accessToken;
      let pageAccessToken = null;
      
      if (pageId !== 'me') {
        // Check if we have a cached page access token
        pageAccessToken = tokens.pageAccessToken;
        
        // If no cached token or if we need to refresh, fetch it
        if (!pageAccessToken) {
          pageAccessToken = await fetchFacebookPageAccessToken(pageId, tokens.accessToken);
          
          // Optionally persist the page access token for future use
          await updatePlatformTokens(userId, 'facebook', {
            pageAccessToken: pageAccessToken,
          });
        }
        
        accessToken = pageAccessToken;
      }
      
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          message: content,
          access_token: accessToken,
        }
      );
      
      const postId = response.data.id;
      
      // Fetch permalink for the published post
      const permalink = await fetchPermalink({
        id: postId,
        accessToken: accessToken,
        platform: 'facebook',
      });
      
      return {
        postId: postId,
        url: permalink,
      };
    } catch (error) {
      // Handle token expiry using shared helper (401 or Graph error code 190)
      if (isGraphTokenExpired(error)) {
        logger.info('Facebook token expired, refreshing...');
        const newTokens = await refreshPlatformToken(userId, 'facebook', tokens.accessToken);
        if (newTokens && newTokens.accessToken) {
          // Retry with new token
          // If posting to a Page (not 'me'), fetch page access token with new user token
          let accessToken = newTokens.accessToken;
          let pageAccessToken = null;
          
          if (pageId !== 'me') {
            // Fetch new page access token using the refreshed user token
            pageAccessToken = await fetchFacebookPageAccessToken(pageId, newTokens.accessToken);
            
            // Optionally persist the page access token for future use
            await updatePlatformTokens(userId, 'facebook', {
              pageAccessToken: pageAccessToken,
            });
            
            accessToken = pageAccessToken;
          }
          
          const retryResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${pageId}/feed`,
            {
              message: content,
              access_token: accessToken,
            }
          );
          
          const postId = retryResponse.data.id;
          
          // Fetch permalink for the published post
          const permalink = await fetchPermalink({
            id: postId,
            accessToken: accessToken,
            platform: 'facebook',
          });
          
          return {
            postId: postId,
            url: permalink,
          };
        }
      }
      throw error;
    }
  }, 3, 1000);
}

/**
 * Post to TikTok
 */
async function postToTikTok(userId, { content, media, options }) {
  const idempotencyKey = generateIdempotencyKey('tiktok', userId, content);
  
  return await retryWithBackoff(async () => {
    let tokens = await getPlatformTokens(userId, 'tiktok');
    if (!tokens) {
      throw new Error('TikTok not connected');
    }
    
    try {
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
      // Handle 401 - token expired
      if (error.response?.status === 401 && tokens.refreshToken) {
        logger.info('TikTok token expired, refreshing...');
        const newTokens = await refreshPlatformToken(userId, 'tiktok', tokens.refreshToken);
        if (newTokens) {
          // Retry with new token
          const retryResponse = await axios.post(
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
                'Authorization': `Bearer ${newTokens.accessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );
          return {
            postId: retryResponse.data.data.publish_id,
            uploadUrl: retryResponse.data.data.upload_url,
          };
        }
      }
      throw error;
    }
  }, 3, 1000);
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
 * Wraps all posts with retry logic and error handling
 */
async function postToPlatform(platformId, userId, { content, media, scheduleTime, options }) {
  const correlationId = options?.correlationId || crypto.randomUUID();
  
  // Import additional posting functions
  const additionalPosting = require('./platformPostingServiceComplete');
  
  const postingFunctions = {
    instagram: postToInstagram,
    twitter: postToTwitter,
    linkedin: postToLinkedIn,
    facebook: postToFacebook,
    tiktok: postToTikTok,
    youtube: additionalPosting.postToYouTube,
    reddit: additionalPosting.postToReddit,
    discord: additionalPosting.postToDiscord,
    medium: additionalPosting.postToMedium,
    substack: additionalPosting.postToSubstack,
    patreon: additionalPosting.postToPatreon,
    ko_fi: additionalPosting.postToKoFi,
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
  
  try {
    const result = await postFunction(userId, { 
      content, 
      media, 
      options: { ...options, correlationId } 
    });
    
    // Status updates are handled by the scheduler service
    return result;
  } catch (error) {
    // Include detailed error info for diagnosis
    const errorDetail = {
      platformId,
      userId,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      correlationId,
    };
    
    logger.error(`Posting failed for ${platformId}:`, errorDetail);
    
    // Status updates are handled by the scheduler service
    throw new Error(`Failed to post to ${platformId}: ${error.message}`);
  }
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

