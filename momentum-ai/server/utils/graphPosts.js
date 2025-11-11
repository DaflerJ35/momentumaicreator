const axios = require('axios');

/**
 * Graph Posts Utilities
 * Helper functions for Facebook Graph API post operations
 */

/**
 * Fetch permalink for a Graph API post
 * @param {Object} params - Parameters object
 * @param {string} params.id - Post/Media ID
 * @param {string} params.accessToken - Access token to use for the request
 * @param {string} params.platform - Platform name ('instagram' or 'facebook')
 * @returns {Promise<string>} - Permalink URL
 */
async function fetchPermalink({ id, accessToken, platform }) {
  const fields = platform === 'instagram' ? 'permalink' : 'permalink_url';
  
  const response = await axios.get(
    `https://graph.facebook.com/v18.0/${id}`,
    {
      params: {
        fields,
        access_token: accessToken,
      },
    }
  );
  
  if (platform === 'instagram') {
    return response.data.permalink || `https://www.instagram.com/p/${id}`;
  } else {
    return response.data.permalink_url || `https://www.facebook.com/${id}`;
  }
}

module.exports = {
  fetchPermalink,
};


