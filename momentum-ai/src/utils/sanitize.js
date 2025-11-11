/**
 * HTML Sanitization Utility
 * Sanitizes HTML content to prevent XSS attacks using DOMPurify
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content with basic formatting support
 * Allows safe HTML tags for content display while preventing XSS
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Use DOMPurify to sanitize HTML
  // Allow basic formatting tags but strip dangerous attributes and scripts
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
}

/**
 * Sanitize plain text and convert newlines to <br> tags
 * Use this for plain text content that needs line breaks
 */
export function sanitizeWithFormatting(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Escape HTML first, then convert newlines to <br>
  const tempDiv = document.createElement('div');
  tempDiv.textContent = text;
  const safeText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Sanitize the result to ensure no XSS
  return DOMPurify.sanitize(safeText.replace(/\n/g, '<br>'), {
    ALLOWED_TAGS: ['br'],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize HTML for rich content display
 * Allows more formatting options while maintaining security
 */
export function sanitizeHTMLAdvanced(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true
  });
}

