/**
 * Unified API Client - All API calls go through the server
 * No API keys needed on the client side!
 */

// Use relative paths in production (same domain), or VITE_API_URL if explicitly set
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is set and not localhost, use it (strip trailing slashes)
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/+$/, '');
  }
  // In production or if VITE_API_URL is localhost, use relative paths (same domain)
  // This works with Vercel serverless functions
  return '';
};

const API_URL = getApiUrl();

// Import global loading indicator (dynamic to avoid circular deps)
let setGlobalLoading;
if (typeof window !== 'undefined') {
  import('../components/ui/GlobalLoadingIndicator').then(module => {
    setGlobalLoading = module.setLoading;
  }).catch(() => {
    // Ignore if module not available
  });
}

/**
 * Get Firebase auth token with automatic refresh
 * Handles token expiration and refresh automatically
 * Returns null if user is not authenticated (instead of throwing)
 */
async function getAuthToken(forceRefresh = false) {
  const { auth } = await import('../lib/firebase');
  const user = auth.currentUser;
  if (!user) {
    return null; // Return null instead of throwing for unauthenticated state
  }
  
  try {
    const token = await user.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    // If token refresh fails, user might need to re-authenticate
    if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled') {
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw error;
  }
}

/**
 * Retry configuration for API requests
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Start with 1 second
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Timeout, rate limit, server errors
  retryableErrors: ['NetworkError', 'Failed to fetch', 'Network request failed']
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error, status) {
  if (status && RETRY_CONFIG.retryableStatuses.includes(status)) {
    return true;
  }
  if (error && RETRY_CONFIG.retryableErrors.some(msg => error.message?.includes(msg))) {
    return true;
  }
  return false;
}

/**
 * Make an API request to the server with retry logic
 */
async function apiRequest(endpoint, options = {}, retryCount = 0) {
  // Get auth token if user is authenticated
  // getAuthToken now returns null for unauthenticated users instead of throwing
  let token = null;
  try {
    token = await getAuthToken();
    // token is null if user is not authenticated - this is expected and handled below
  } catch (error) {
    // Only real token errors (expired, disabled) should throw
    // These indicate actual authentication problems, not just "no user logged in"
    throw error;
  }
  
  // Normalize endpoint:
  // - Absolute URLs are used as-is
  // - If endpoint is relative and does NOT start with /api, prefix it with /api
  // - Ensure there is exactly one slash between base and endpoint
  let normalizedEndpoint = endpoint;
  if (!/^https?:\/\//i.test(normalizedEndpoint)) {
    // Ensure leading slash
    if (!normalizedEndpoint.startsWith('/')) {
      normalizedEndpoint = '/' + normalizedEndpoint;
    }
    // Auto-prefix /api for client calls like unifiedAPI.get('/platforms/connected')
    if (!normalizedEndpoint.startsWith('/api/')) {
      normalizedEndpoint = '/api' + normalizedEndpoint;
    }
  }

  const base = API_URL || '';
  const url = /^https?:\/\//i.test(normalizedEndpoint)
    ? normalizedEndpoint
    : (base ? `${base.replace(/\/+$/, '')}/${normalizedEndpoint.replace(/^\/+/, '')}` : normalizedEndpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  let response;
  let lastError;

  // Set global loading state
  if (setGlobalLoading) {
    setGlobalLoading(true);
  }

  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal, // Support AbortController
    });

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401 && token) {
      try {
        // Try refreshing token once
        token = await getAuthToken(true);
        headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, {
          ...options,
          headers,
          signal: options.signal,
        });
      } catch (refreshError) {
        // If refresh fails, redirect to login for protected endpoints
        if (refreshError.message.includes('expired') || refreshError.message.includes('authenticated')) {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
          }
        }
        throw refreshError;
      }
    }

    // Retry on retryable status codes
    if (!response.ok && isRetryableError(null, response.status) && retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
      await sleep(delay);
      return apiRequest(endpoint, options, retryCount + 1);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      // Provide user-friendly error messages
      let errorMessage = error.message || error.error || `Request failed: ${response.statusText}`;
      
      // Map common HTTP status codes to user-friendly messages
      const statusMessages = {
        400: 'Invalid request. Please check your input and try again.',
        401: 'Your session has expired. Please sign in again.',
        403: 'You don\'t have permission to perform this action.',
        404: 'The requested resource was not found.',
        408: 'Request timed out. Please try again.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'Server error. Our team has been notified. Please try again in a moment.',
        502: 'Service temporarily unavailable. Please try again in a moment.',
        503: 'Service is currently unavailable. Please try again later.',
        504: 'Request timed out. Please try again.',
      };
      
      if (statusMessages[response.status]) {
        errorMessage = statusMessages[response.status];
      }
      
      const apiError = new Error(errorMessage);
      apiError.status = response.status;
      apiError.code = error.code;
      throw apiError;
    }

    return response;
  } catch (error) {
    // Handle network errors and retry
    if (isRetryableError(error) && retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount);
      await sleep(delay);
      return apiRequest(endpoint, options, retryCount + 1);
    }
    
    // Don't expose sensitive error details
    if (error.name === 'AbortError') {
      throw error; // Let abort errors pass through
    }
    
    // Provide user-friendly error message
    let userMessage = 'Network error. Please check your connection and try again.';
    if (error.message && !error.message.includes('fetch')) {
      userMessage = error.message;
    }
    
    const apiError = new Error(userMessage);
    apiError.originalError = error;
    throw apiError;
  } finally {
    // Clear global loading state
    if (setGlobalLoading) {
      setGlobalLoading(false);
    }
  }
}

/**
 * AI API - All AI operations go through server
 */
export const aiAPI = {
  /**
   * Generate content
   */
  async generate(prompt, options = {}) {
    // Use model from options or let server use default (Ollama)
    // No hardcoded model mapping - server handles provider-specific models
    const model = options.model || undefined; // Let server use default Ollama model
    
    const response = await apiRequest('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        model,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048,
        provider: options.provider,
      }),
    });
    
    const data = await response.json();
    return data.content;
  },

  /**
   * Generate structured JSON content
   */
  async generateStructured(prompt, schema, options = {}) {
    // Use model from options or let server use default (Ollama)
    // No hardcoded model mapping - server handles provider-specific models
    const model = options.model || undefined; // Let server use default Ollama model
    
    const response = await apiRequest('/api/ai/generate-structured', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        schema,
        model,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048,
        provider: options.provider,
      }),
    });
    
    const data = await response.json();
    return data.data;
  },

  /**
   * Stream content with Server-Sent Events
   */
  async stream(prompt, onChunk, options = {}) {
    // Use model from options or let server use default (Ollama)
    // No hardcoded model mapping - server handles provider-specific models
    const model = options.model || undefined; // Let server use default Ollama model
    
    const response = await apiRequest('/api/ai/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        prompt,
        model,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2048,
        provider: options.provider,
      }),
    });

    if (!response.body) {
      throw new Error('Streaming not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                fullResponse += data.chunk;
                if (onChunk) onChunk(data.chunk, fullResponse);
              }
              if (data.done) return fullResponse;
              if (data.error) throw new Error(data.error);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullResponse;
    } finally {
      reader.releaseLock();
    }
  },

  /**
   * Analyze image
   */
  async analyzeImage(imageData, prompt) {
    const response = await apiRequest('/api/ai/analyze-image', {
      method: 'POST',
      body: JSON.stringify({ imageData, prompt }),
    });
    
    const data = await response.json();
    return data.analysis;
  },
};

/**
 * Multimedia API - All media generation goes through server
 */
export const mediaAPI = {
  /**
   * Generate image
   */
  async generateImage(prompt, options = {}) {
    const response = await apiRequest('/api/multimedia/image/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        ...options,
      }),
    });
    
    return response.json();
  },

  /**
   * Generate video
   */
  async generateVideo(prompt, options = {}) {
    const response = await apiRequest('/api/multimedia/video/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        ...options,
      }),
    });
    
    return response.json();
  },

  /**
   * Generate voice
   */
  async generateVoice(text, options = {}) {
    const response = await apiRequest('/api/multimedia/voice/generate', {
      method: 'POST',
      body: JSON.stringify({
        text,
        ...options,
      }),
    });
    
    return response.json();
  },
};

/**
 * Health check
 */
export async function healthCheck() {
  try {
    const response = await apiRequest('/api/health');
    return await response.json();
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

/**
 * Platform API - Platform integrations and posting
 */
export const platformAPI = {
  /**
   * Initialize OAuth for a platform
   */
  async initOAuth(platformId) {
    const response = await apiRequest(`/api/platforms/${platformId}/oauth/init`, {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get connected platforms
   */
  async getConnectedPlatforms() {
    const response = await apiRequest('/api/platforms/connected', {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(platformId) {
    const response = await apiRequest(`/api/platforms/${platformId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  /**
   * Post to a platform
   */
  async post(platformId, { content, media, scheduleTime, options }) {
    const response = await apiRequest(`/api/platforms/${platformId}/post`, {
      method: 'POST',
      body: JSON.stringify({ content, media, scheduleTime, options }),
    });
    return response.json();
  },

  /**
   * Schedule content to multiple platforms
   */
  async schedule({ platforms, content, media, scheduleTime, options }) {
    const response = await apiRequest('/api/platforms/schedule', {
      method: 'POST',
      body: JSON.stringify({ platforms, content, media, scheduleTime, options }),
    });
    return response.json();
  },

  /**
   * Get platform analytics
   */
  async getAnalytics(platformId, { startDate, endDate }) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiRequest(`/api/platforms/${platformId}/analytics?${params}`, {
      method: 'GET',
    });
    return response.json();
  },
};

/**
 * Blog API - Blog platform posting
 */
export const blogAPI = {
  /**
   * Post to WordPress
   */
  async postToWordPress({ title, content, categories, tags, featuredImage, status }) {
    const response = await apiRequest('/api/blog/wordpress', {
      method: 'POST',
      body: JSON.stringify({ title, content, categories, tags, featuredImage, status }),
    });
    return response.json();
  },

  /**
   * Post to Medium
   */
  async postToMedium({ title, content, tags, publishStatus }) {
    const response = await apiRequest('/api/blog/medium', {
      method: 'POST',
      body: JSON.stringify({ title, content, tags, publishStatus }),
    });
    return response.json();
  },

  /**
   * Post to Substack
   */
  async postToSubstack({ title, body, subtitle, sendEmail }) {
    const response = await apiRequest('/api/blog/substack', {
      method: 'POST',
      body: JSON.stringify({ title, body, subtitle, sendEmail }),
    });
    return response.json();
  },

  /**
   * Post to Ghost
   */
  async postToGhost({ title, html, tags, featured, status }) {
    const response = await apiRequest('/api/blog/ghost', {
      method: 'POST',
      body: JSON.stringify({ title, html, tags, featured, status }),
    });
    return response.json();
  },
};

/**
 * Unified API client with all methods
 */
export const unifiedAPI = {
  get: async (endpoint, options = {}) => {
    const response = await apiRequest(endpoint, {
      ...options,
      method: 'GET',
    });
    return response.json();
  },
  
  post: async (endpoint, data, options = {}) => {
    const method = options.method || 'POST';
    const response = await apiRequest(endpoint, {
      ...options,
      method,
      body: data ? JSON.stringify(data) : undefined,
    });
    return response.json();
  },
  
  delete: async (endpoint, options = {}) => {
    const response = await apiRequest(endpoint, {
      ...options,
      method: 'DELETE',
    });
    return response.json();
  },
};

export default {
  ai: aiAPI,
  media: mediaAPI,
  platform: platformAPI,
  blog: blogAPI,
  healthCheck,
};

