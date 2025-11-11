const logger = require('./logger');
const crypto = require('crypto');

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @param {Function} shouldRetry - Function to determine if error should be retried (default: retry on any error)
 * @returns {Promise} Result of the function
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000, shouldRetry = null) {
  const correlationId = crypto.randomUUID();
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        logger.warn(`Error not retryable, failing immediately`, { correlationId, error: error.message });
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        logger.error(`Max retries (${maxRetries}) exceeded`, { correlationId, error: error.message });
        break;
      }
      
      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
      const totalDelay = delay + jitter;
      
      logger.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(totalDelay)}ms`, {
        correlationId,
        error: error.message,
        attempt: attempt + 1,
        maxRetries,
      });
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
}

/**
 * Determine if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} True if error should be retried
 */
function isRetryableError(error) {
  // Retry on network errors, timeouts, and 5xx errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }
  
  // Retry on 5xx server errors
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true;
  }
  
  // Retry on 429 (rate limit)
  if (error.response?.status === 429) {
    return true;
  }
  
  // Retry on 408 (request timeout)
  if (error.response?.status === 408) {
    return true;
  }
  
  // Don't retry on 4xx client errors (except 429, 408)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    return false;
  }
  
  // Retry on other errors by default
  return true;
}

/**
 * Generate idempotency key for requests
 * @param {string} platformId - Platform identifier
 * @param {string} userId - User identifier
 * @param {object} content - Post content
 * @returns {string} Idempotency key
 */
function generateIdempotencyKey(platformId, userId, content) {
  const contentHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ platformId, userId, content: content.substring(0, 100) }))
    .digest('hex')
    .substring(0, 16);
  
  return `${platformId}_${userId}_${contentHash}_${Date.now()}`;
}

module.exports = {
  retryWithBackoff,
  isRetryableError,
  generateIdempotencyKey,
};

