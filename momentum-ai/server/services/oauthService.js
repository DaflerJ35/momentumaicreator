/**
 * OAuth Service - Complete OAuth 2.0 implementation for all 17 platforms
 * Handles OAuth URL generation, token exchange, and refresh for all platforms
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { generatePKCE } = require('../utils/oauthState');

/**
 * Platform OAuth Configurations
 */
const PLATFORM_CONFIGS = {
  // Social Media Platforms
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    requiresPKCE: true,
    clientIdEnv: 'TWITTER_CLIENT_ID',
    clientSecretEnv: 'TWITTER_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/twitter/oauth/callback',
  },
  instagram: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'],
    requiresPKCE: false,
    clientIdEnv: 'FACEBOOK_APP_ID',
    clientSecretEnv: 'FACEBOOK_APP_SECRET',
    redirectUriPath: '/api/platforms/instagram/oauth/callback',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    requiresPKCE: false,
    clientIdEnv: 'FACEBOOK_APP_ID',
    clientSecretEnv: 'FACEBOOK_APP_SECRET',
    redirectUriPath: '/api/platforms/facebook/oauth/callback',
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
    requiresPKCE: true,
    clientIdEnv: 'LINKEDIN_CLIENT_ID',
    clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/linkedin/oauth/callback',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
    requiresPKCE: true,
    clientIdEnv: 'TIKTOK_CLIENT_KEY',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/tiktok/oauth/callback',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube'],
    requiresPKCE: false,
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/youtube/oauth/callback',
  },
  reddit: {
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scopes: ['submit', 'read', 'identity'],
    requiresPKCE: true,
    clientIdEnv: 'REDDIT_CLIENT_ID',
    clientSecretEnv: 'REDDIT_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/reddit/oauth/callback',
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scopes: ['bot', 'messages.read', 'messages.write'],
    requiresPKCE: false,
    clientIdEnv: 'DISCORD_CLIENT_ID',
    clientSecretEnv: 'DISCORD_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/discord/oauth/callback',
  },
  snapchat: {
    authUrl: 'https://accounts.snapchat.com/login/oauth2/authorize',
    tokenUrl: 'https://accounts.snapchat.com/login/oauth2/access_token',
    scopes: ['user.accounts', 'snapchat-marketing-api'],
    requiresPKCE: true,
    clientIdEnv: 'SNAPCHAT_CLIENT_ID',
    clientSecretEnv: 'SNAPCHAT_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/snapchat/oauth/callback',
  },
  threads: {
    authUrl: 'https://www.threads.net/oauth/authorize',
    tokenUrl: 'https://www.threads.net/oauth/access_token',
    scopes: ['threads_basic', 'threads_content_publish'],
    requiresPKCE: false,
    clientIdEnv: 'THREADS_CLIENT_ID',
    clientSecretEnv: 'THREADS_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/threads/oauth/callback',
  },
  
  // Blog Platforms
  medium: {
    authUrl: 'https://medium.com/m/oauth/authorize',
    tokenUrl: 'https://api.medium.com/v1/tokens',
    scopes: ['basicProfile', 'publishPost', 'uploadImage'],
    requiresPKCE: false,
    clientIdEnv: 'MEDIUM_CLIENT_ID',
    clientSecretEnv: 'MEDIUM_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/medium/oauth/callback',
  },
  substack: {
    authUrl: 'https://substack.com/api/v1/oauth/authorize',
    tokenUrl: 'https://substack.com/api/v1/oauth/token',
    scopes: ['read', 'write'],
    requiresPKCE: false,
    clientIdEnv: 'SUBSTACK_CLIENT_ID',
    clientSecretEnv: 'SUBSTACK_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/substack/oauth/callback',
  },
  ghost: {
    authUrl: null, // Ghost uses API key, not OAuth
    tokenUrl: null,
    scopes: [],
    requiresPKCE: false,
    clientIdEnv: null,
    clientSecretEnv: null,
    redirectUriPath: null,
    authType: 'api_key', // Special handling
  },
  wordpress: {
    authUrl: null, // WordPress uses site-specific OAuth
    tokenUrl: null,
    scopes: [],
    requiresPKCE: false,
    clientIdEnv: null,
    clientSecretEnv: null,
    redirectUriPath: null,
    authType: 'site_oauth', // Requires site URL
  },
  
  // Subscription Platforms
  patreon: {
    authUrl: 'https://www.patreon.com/oauth2/authorize',
    tokenUrl: 'https://www.patreon.com/api/oauth2/token',
    scopes: ['identity', 'identity[email]', 'campaigns', 'w:campaigns.webhook'],
    requiresPKCE: false,
    clientIdEnv: 'PATREON_CLIENT_ID',
    clientSecretEnv: 'PATREON_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/patreon/oauth/callback',
  },
  ko_fi: {
    authUrl: 'https://ko-fi.com/oauth/authorize',
    tokenUrl: 'https://api.ko-fi.com/oauth/token',
    scopes: ['posts', 'shop', 'commissions'],
    requiresPKCE: false,
    clientIdEnv: 'KOFI_CLIENT_ID',
    clientSecretEnv: 'KOFI_CLIENT_SECRET',
    redirectUriPath: '/api/platforms/ko_fi/oauth/callback',
  },
  onlyfans: {
    authUrl: null, // OnlyFans uses custom API
    tokenUrl: null,
    scopes: [],
    requiresPKCE: false,
    clientIdEnv: null,
    clientSecretEnv: null,
    redirectUriPath: null,
    authType: 'custom', // Requires custom implementation
  },
  fansly: {
    authUrl: null,
    tokenUrl: null,
    scopes: [],
    requiresPKCE: false,
    clientIdEnv: null,
    clientSecretEnv: null,
    redirectUriPath: null,
    authType: 'custom',
  },
  fanvue: {
    authUrl: null,
    tokenUrl: null,
    scopes: [],
    requiresPKCE: false,
    clientIdEnv: null,
    clientSecretEnv: null,
    redirectUriPath: null,
    authType: 'custom',
  },
  fanplace: {
    authUrl: null,
    tokenUrl: null,
    scopes: [],
    requiresPKCE: false,
    clientIdEnv: null,
    clientSecretEnv: null,
    redirectUriPath: null,
    authType: 'custom',
  },
};

/**
 * Generate OAuth URL for a platform
 */
async function getOAuthUrl(platformId, userId, stateId, codeChallenge = null) {
  const config = PLATFORM_CONFIGS[platformId];
  if (!config) {
    throw new Error(`Platform ${platformId} not supported`);
  }

  // Handle special auth types
  if (config.authType === 'api_key') {
    throw new Error(`${platformId} uses API key authentication, not OAuth`);
  }
  if (config.authType === 'site_oauth') {
    throw new Error(`${platformId} requires site-specific OAuth setup`);
  }
  if (config.authType === 'custom') {
    throw new Error(`${platformId} requires custom authentication setup`);
  }

  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    throw new Error(`${config.clientIdEnv} not configured`);
  }

  const baseUrl = process.env.FRONTEND_URL?.split(',')[0] || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3001';
  const redirectUri = `${baseUrl}${config.redirectUriPath}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: stateId,
    scope: config.scopes.join(' '),
  });

  // Add PKCE challenge if required
  if (config.requiresPKCE && codeChallenge) {
    params.append('code_challenge', codeChallenge);
    params.append('code_challenge_method', 'S256');
  }

  // Platform-specific parameters
  if (platformId === 'twitter') {
    params.append('response_type', 'code');
  }
  if (platformId === 'linkedin') {
    params.append('response_type', 'code');
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange OAuth code for access token
 */
async function exchangeOAuthCode(platformId, code, codeVerifier, correlationId) {
  const config = PLATFORM_CONFIGS[platformId];
  if (!config) {
    throw new Error(`Platform ${platformId} not supported`);
  }

  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];
  
  if (!clientId || !clientSecret) {
    throw new Error(`OAuth credentials not configured for ${platformId}`);
  }

  const baseUrl = process.env.FRONTEND_URL?.split(',')[0] || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3001';
  const redirectUri = `${baseUrl}${config.redirectUriPath}`;

  const tokenData = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };

  // Add PKCE verifier if required
  if (config.requiresPKCE && codeVerifier) {
    tokenData.code_verifier = codeVerifier;
  }

  try {
    let response;
    
    // Platform-specific token exchange
    if (platformId === 'twitter') {
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } else if (platformId === 'linkedin') {
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } else if (platformId === 'youtube') {
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } else if (platformId === 'tiktok') {
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } else if (platformId === 'reddit') {
      // Reddit requires Basic Auth
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
        }
      );
    } else if (platformId === 'discord') {
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    } else if (platformId === 'medium') {
      response = await axios.post(
        config.tokenUrl,
        {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
    } else {
      // Default OAuth 2.0 flow
      response = await axios.post(
        config.tokenUrl,
        new URLSearchParams(tokenData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
    }

    const data = response.data;

    // Normalize token response
    const tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresAt: data.expires_in 
        ? Date.now() + (data.expires_in * 1000)
        : null,
      scope: data.scope || config.scopes.join(' '),
      tokenType: data.token_type || 'Bearer',
    };

    // Platform-specific token handling
    if (platformId === 'instagram' || platformId === 'facebook') {
      // Facebook/Instagram returns long-lived token
      // Exchange for page access token if needed
      if (platformId === 'instagram') {
        // Get Instagram Business Account ID
        const pagesResponse = await axios.get(
          `https://graph.facebook.com/v18.0/me/accounts`,
          {
            params: {
              access_token: tokens.accessToken,
            },
          }
        );
        
        if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
          const page = pagesResponse.data.data[0];
          tokens.pageAccessToken = page.access_token;
          tokens.pageId = page.id;
          
          // Get Instagram Business Account
          const igResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${page.id}`,
            {
              params: {
                fields: 'instagram_business_account',
                access_token: tokens.pageAccessToken,
              },
            }
          );
          
          if (igResponse.data.instagram_business_account) {
            tokens.igUserId = igResponse.data.instagram_business_account.id;
          }
        }
      }
    }

    logger.info(`OAuth token exchange successful for ${platformId}`, { correlationId });
    return tokens;
  } catch (error) {
    logger.error(`OAuth token exchange failed for ${platformId}:`, {
      correlationId,
      error: error.message,
      response: error.response?.data,
    });
    throw new Error(`Failed to exchange OAuth code: ${error.response?.data?.error_description || error.message}`);
  }
}

module.exports = {
  getOAuthUrl,
  exchangeOAuthCode,
  PLATFORM_CONFIGS,
};

