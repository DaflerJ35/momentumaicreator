/**
 * Server AI Service - Connects to backend API for AI operations
 * Supports both Gemini and Ollama through the server
 */

import { getApiUrl } from './utils';
import { auth } from './firebase';

const API_URL = getApiUrl();

/**
 * Get Firebase ID token for authenticated requests
 * Returns null if user is not authenticated
 */
async function getIdToken() {
  try {
    if (!auth || auth._isMock || !auth.currentUser) {
      return null;
    }
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

/**
 * Create headers with authentication token if available
 */
async function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = await getIdToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Generate content using server API
 */
export const generateContent = async (prompt, options = {}) => {
  const {
    model,
    temperature = 0.7,
    maxTokens = 2048,
    provider
  } = options;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        model,
        temperature,
        maxTokens,
        provider
      })
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle 401 by showing auth modal
      if (response.status === 401) {
        // Trigger auth modal via event or context
        window.dispatchEvent(new CustomEvent('auth-required'));
        throw new Error('Authentication required. Please sign in to use AI features.');
      }
      throw new Error(error.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Server AI generation error:', error);
    throw new Error(error.message || 'Failed to generate content. Please try again.');
  }
};

/**
 * Generate structured JSON content using server API
 */
export const generateStructuredContent = async (prompt, schema, options = {}) => {
  const {
    model,
    temperature = 0.7,
    maxTokens = 2048,
    provider
  } = options;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai/generate-structured`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        schema,
        model,
        temperature,
        maxTokens,
        provider
      })
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-required'));
        throw new Error('Authentication required. Please sign in to use AI features.');
      }
      throw new Error(error.error || 'Failed to generate structured content');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Server AI structured generation error:', error);
    throw new Error(error.message || 'Failed to generate structured content. Please try again.');
  }
};

/**
 * Stream content using Server-Sent Events
 * Includes abort/timeout handling and browser compatibility checks
 */
export const generateStreamingContent = async (prompt, onChunk, options = {}) => {
  const {
    model,
    temperature = 0.7,
    maxTokens = 2048,
    provider,
    jsonMode = false,
    timeout = 300000 // 5 minutes default timeout
  } = options;

  // Check if ReadableStream is supported
  if (typeof ReadableStream === 'undefined') {
    console.warn('ReadableStream not supported, falling back to non-streaming API');
      // Fallback to non-streaming endpoint
    try {
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model,
          temperature,
          maxTokens,
          provider,
          jsonMode
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const data = await response.json();
      const fullResponse = data.content || '';
      
      // Call onChunk once with full text for consistency
      if (onChunk) {
        onChunk(fullResponse, fullResponse);
      }
      
      return fullResponse;
    } catch (error) {
      console.error('Server AI fallback error:', error);
      throw new Error(error.message || 'Failed to generate content. Please try again.');
    }
  }

  // Create AbortController for timeout and cancellation
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, timeout);

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        model,
        temperature,
        maxTokens,
        provider,
        jsonMode
      }),
      signal: abortController.signal
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to stream content' }));
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-required'));
        throw new Error('Authentication required. Please sign in to use AI features.');
      }
      throw new Error(error.error || 'Failed to stream content');
    }

    // Check if response.body exists
    if (!response.body) {
      throw new Error('Streaming not supported by server response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = ''; // Buffer to handle partial lines across chunks

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk; // Append chunk to buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                fullResponse += data.chunk;
                if (onChunk) {
                  onChunk(data.chunk, fullResponse);
                }
              }
              if (data.done) {
                clearTimeout(timeoutId);
                return fullResponse;
              }
              if (data.error) {
                clearTimeout(timeoutId);
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn('Invalid JSON in stream:', e);
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              fullResponse += data.chunk;
              if (onChunk) {
                onChunk(data.chunk, fullResponse);
              }
            }
            if (data.done) {
              clearTimeout(timeoutId);
              return fullResponse;
            }
            if (data.error) {
              clearTimeout(timeoutId);
              throw new Error(data.error);
            }
          } catch (e) {
            console.warn('Invalid JSON in final buffer:', e);
          }
        }
      }

      clearTimeout(timeoutId);
      return fullResponse;
    } catch (streamError) {
      clearTimeout(timeoutId);
      // Clean up reader on error
      try {
        reader.cancel();
      } catch (cancelError) {
        // Ignore cancel errors
      }
      throw streamError;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. The generation took too long. Please try again.');
    }
    
    console.error('Server AI streaming error:', error);
    throw new Error(error.message || 'Failed to stream content. Please try again.');
  }
};

/**
 * Analyze image using server API
 */
export const analyzeImage = async (imageData, prompt) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai/analyze-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        imageData,
        prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-required'));
        throw new Error('Authentication required. Please sign in to use AI features.');
      }
      throw new Error(error.error || 'Failed to analyze image');
    }

    const data = await response.json();
    return data.analysis;
  } catch (error) {
    console.error('Server AI image analysis error:', error);
    throw new Error(error.message || 'Failed to analyze image. Please try again.');
  }
};

/**
 * Get available models from server
 */
export const getAvailableModels = async () => {
  try {
    const response = await fetch(`${API_URL}/api/ai/models`);
    if (!response.ok) {
      throw new Error('Failed to get models');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting models:', error);
    return { models: [], provider: 'unknown' };
  }
};

export default {
  generateContent,
  generateStructuredContent,
  generateStreamingContent,
  analyzeImage,
  getAvailableModels,
};

