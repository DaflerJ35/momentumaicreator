/**
 * Graph API Authentication Utilities
 * Helper functions for detecting token expiry in Facebook Graph API errors
 */

/**
 * Check if a Graph API error indicates token expiry
 * @param {Error} error - Axios error object from Graph API request
 * @returns {boolean} - True if error indicates token expiry
 */
function isGraphTokenExpired(error) {
  // Check for HTTP 401 status (Unauthorized)
  if (error.response?.status === 401) {
    return true;
  }
  
  // Check for Graph API error code 190 (OAuthException - token expired/invalid)
  // This code indicates token expiry regardless of subcode
  // Common subcodes include: 463 (expired access token), 467 (invalid access token)
  const graphErrorCode = error.response?.data?.error?.code;
  if (graphErrorCode === 190) {
    return true;
  }
  
  return false;
}

module.exports = {
  isGraphTokenExpired,
};

