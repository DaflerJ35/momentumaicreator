/**
 * Security Utilities
 * Provides security helper functions for URL validation, filename sanitization, and input validation
 */

const logger = require('./logger');
const { URL } = require('url');
const path = require('path');

/**
 * Allowed URL schemes for external resources
 */
const ALLOWED_SCHEMES = ['http:', 'https:'];

/**
 * Blocked private/internal IP ranges
 */
const PRIVATE_IP_RANGES = [
  /^10\./,                           // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^192\.168\./,                     // 192.168.0.0/16
  /^127\./,                          // 127.0.0.0/8 (localhost)
  /^169\.254\./,                     // 169.254.0.0/16 (link-local)
  /^::1$/,                           // IPv6 localhost
  /^fc00:/,                          // IPv6 private
  /^fe80:/,                          // IPv6 link-local
  /^0\.0\.0\.0$/,                    // Invalid
];

/**
 * Allowed domains for external image/video downloads (if you want to restrict to specific CDNs)
 * Set to null to allow all public domains (but still block private IPs)
 */
const ALLOWED_DOMAINS = process.env.ALLOWED_DOWNLOAD_DOMAINS 
  ? process.env.ALLOWED_DOWNLOAD_DOMAINS.split(',').map(d => d.trim())
  : null;

/**
 * Validate and sanitize URL to prevent SSRF attacks
 * @param {string} url - URL to validate
 * @param {boolean} allowDataUrl - Whether to allow data URLs (default: true)
 * @returns {Object} - { valid: boolean, url: string, error: string }
 */
function validateUrl(url, allowDataUrl = true) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  // Allow data URLs if specified
  if (allowDataUrl && url.startsWith('data:')) {
    // Validate data URL format: data:[<mediatype>][;base64],<data>
    const dataUrlMatch = url.match(/^data:([^;]+)?(;base64)?,(.+)$/);
    if (!dataUrlMatch) {
      return { valid: false, error: 'Invalid data URL format' };
    }

    // Validate MIME type (basic check)
    const mimeType = dataUrlMatch[1] || 'text/plain';
    if (!mimeType.match(/^(image|video|audio)\//)) {
      return { valid: false, error: 'Data URL must have image, video, or audio MIME type' };
    }

    return { valid: true, url, isDataUrl: true };
  }

  try {
    const parsedUrl = new URL(url);

    // Check scheme
    if (!ALLOWED_SCHEMES.includes(parsedUrl.protocol)) {
      return { valid: false, error: `URL scheme must be http or https, got: ${parsedUrl.protocol}` };
    }

    // Resolve hostname to check for private IPs
    const hostname = parsedUrl.hostname;

    // Block private IP ranges
    for (const range of PRIVATE_IP_RANGES) {
      if (range.test(hostname)) {
        return { valid: false, error: 'URL points to private/internal IP address' };
      }
    }

    // Block localhost variations
    const lowerHostname = hostname.toLowerCase();
    if (lowerHostname === 'localhost' || 
        lowerHostname === '0.0.0.0' || 
        lowerHostname.startsWith('127.') ||
        lowerHostname === '::1') {
      return { valid: false, error: 'URL points to localhost' };
    }

    // Check allowed domains if configured
    if (ALLOWED_DOMAINS && ALLOWED_DOMAINS.length > 0) {
      if (!ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain))) {
        return { valid: false, error: `URL domain not in allowed list: ${hostname}` };
      }
    }

    // Validate URL structure
    if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
      return { valid: false, error: 'Invalid URL: missing hostname' };
    }

    return { valid: true, url: parsedUrl.href, isDataUrl: false };
  } catch (error) {
    return { valid: false, error: `Invalid URL format: ${error.message}` };
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param {string} filename - Original filename
 * @param {string} defaultExtension - Default extension if none provided (default: 'txt')
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(filename, defaultExtension = 'txt') {
  if (!filename || typeof filename !== 'string') {
    return `file_${Date.now()}.${defaultExtension}`;
  }

  // Remove path components (../, ./, etc.)
  let sanitized = path.basename(filename);

  // Remove any remaining path separators
  sanitized = sanitized.replace(/[/\\]/g, '_');

  // Remove or replace dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '_');

  // Limit length
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const nameWithoutExt = path.basename(sanitized, ext);
    sanitized = nameWithoutExt.substring(0, 255 - ext.length) + ext;
  }

  // Ensure it's not empty or just dots
  if (!sanitized || sanitized.trim().length === 0 || /^\.+$/.test(sanitized)) {
    sanitized = `file_${Date.now()}.${defaultExtension}`;
  }

  // Ensure it has an extension
  if (!path.extname(sanitized)) {
    sanitized += `.${defaultExtension}`;
  }

  return sanitized;
}

/**
 * Validate file MIME type
 * @param {string} mimeType - MIME type to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether MIME type is allowed
 */
function validateMimeType(mimeType, allowedTypes) {
  if (!mimeType || typeof mimeType !== 'string') {
    return false;
  }

  return allowedTypes.some(allowed => {
    // Exact match
    if (mimeType === allowed) {
      return true;
    }
    // Wildcard match (e.g., 'image/*' matches 'image/png')
    if (allowed.endsWith('/*')) {
      const baseType = allowed.slice(0, -2);
      return mimeType.startsWith(baseType + '/');
    }
    return false;
  });
}

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

/**
 * Allowed audio MIME types
 */
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4'
];

/**
 * Allowed video MIME types
 */
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/ogg'
];

/**
 * Validate image file
 */
function validateImageFile(mimeType, filename) {
  return validateMimeType(mimeType, ALLOWED_IMAGE_TYPES);
}

/**
 * Validate audio file
 */
function validateAudioFile(mimeType, filename) {
  return validateMimeType(mimeType, ALLOWED_AUDIO_TYPES);
}

/**
 * Validate video file
 */
function validateVideoFile(mimeType, filename) {
  return validateMimeType(mimeType, ALLOWED_VIDEO_TYPES);
}

/**
 * Sanitize user input string
 * @param {string} input - User input to sanitize
 * @param {number} maxLength - Maximum length (default: 10000)
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input, maxLength = 10000) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate prompt input (for AI generation)
 * @param {string} prompt - Prompt to validate
 * @param {number} maxLength - Maximum length (default: 10000)
 * @returns {Object} - { valid: boolean, prompt: string, error: string }
 */
function validatePrompt(prompt, maxLength = 10000) {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required and must be a string' };
  }

  const sanitized = sanitizeInput(prompt, maxLength);

  if (sanitized.length === 0) {
    return { valid: false, error: 'Prompt cannot be empty' };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Prompt exceeds maximum length of ${maxLength} characters` };
  }

  return { valid: true, prompt: sanitized };
}

module.exports = {
  validateUrl,
  sanitizeFilename,
  validateMimeType,
  validateImageFile,
  validateAudioFile,
  validateVideoFile,
  sanitizeInput,
  validatePrompt,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_VIDEO_TYPES,
};

