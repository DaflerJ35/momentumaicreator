/**
 * Unified API Client - All API calls go through the server
 * No API keys needed on the client side!
 */

// Use relative paths in production (same domain), or VITE_API_URL if explicitly set
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is set and not localhost, use it
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  // In production or if VITE_API_URL is localhost, use relative paths (same domain)
  // This works with Vercel serverless functions
  return '';
};

const API_URL = getApiUrl();

/**
 * Get Firebase auth token with automatic refresh
 * Handles token expiration and refresh automatically
 */
async function getAuthToken(forceRefresh = false) {
  const { auth } = await import('../lib/firebase');
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
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
 * Make an API request to the server
 */
async function apiRequest(endpoint, options = {}) {
  // Get auth token if user is authenticated
  let token = null;
  try {
    token = await getAuthToken().catch(() => null);
  } catch (error) {
    // If token retrieval fails and it's an auth error, don't include token
    if (!error.message.includes('authenticated')) {
      throw error;
    }
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(url, {
    ...options,
    headers,
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

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    // Don't expose sensitive error details
    const errorMessage = error.message || error.error || `Request failed: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response;
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

