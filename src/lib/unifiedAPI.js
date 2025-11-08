/**
 * Unified API Client - All API calls go through the server
 * No API keys needed on the client side!
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Make an API request to the server
 */
async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
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
    // Map model names if needed
    const modelMap = {
      'pro': 'gemini-1.5-pro-latest',
      'flash': 'gemini-1.5-flash-latest',
    };
    
    const model = modelMap[options.model] || options.model || 'gemini-1.5-flash-latest';
    
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
    // Map model names if needed
    const modelMap = {
      'pro': 'gemini-1.5-pro-latest',
      'flash': 'gemini-1.5-flash-latest',
    };
    
    const model = modelMap[options.model] || options.model || 'gemini-1.5-flash-latest';
    
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
    // Map model names if needed
    const modelMap = {
      'pro': 'gemini-1.5-pro-latest',
      'flash': 'gemini-1.5-flash-latest',
    };
    
    const model = modelMap[options.model] || options.model || 'gemini-1.5-flash-latest';
    
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

export default {
  ai: aiAPI,
  media: mediaAPI,
  healthCheck,
};

