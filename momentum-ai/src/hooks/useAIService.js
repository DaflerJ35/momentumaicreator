import { useState, useCallback, useRef } from 'react';
import { aiAPI } from '../lib/unifiedAPI';
import { toast } from 'sonner';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
};

export const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const requestTimestamps = useRef([]);
  const abortControllerRef = useRef(null);

  /**
   * Check if rate limit is exceeded
   */
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    // Remove timestamps older than the rate limit window
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => now - timestamp < RATE_LIMIT.windowMs
    );

    if (requestTimestamps.current.length >= RATE_LIMIT.maxRequests) {
      const oldestRequest = requestTimestamps.current[0];
      const waitTime = Math.ceil((RATE_LIMIT.windowMs - (now - oldestRequest)) / 1000);
      throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
    }

    requestTimestamps.current.push(now);
  }, []);

  /**
   * Exponential backoff retry logic
   */
  const retryWithBackoff = useCallback(async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        const isLastAttempt = attempt === maxRetries - 1;
        const isTransientError = err.message.includes('quota') || 
                                  err.message.includes('rate limit') ||
                                  err.message.includes('network') ||
                                  err.message.includes('timeout');

        if (isLastAttempt || !isTransientError) {
          throw err;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (import.meta.env.DEV) {
          console.log(`Retrying AI request (attempt ${attempt + 2}/${maxRetries})...`);
        }
      }
    }
  }, []);

  /**
   * Cancel any in-flight requests
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  /**
   * Get user-friendly error message
   */
  const getUserFriendlyError = useCallback((err) => {
    if (err.message.includes('quota')) {
      return 'API quota exceeded. Please try again later or upgrade your plan.';
    } else if (err.message.includes('rate limit')) {
      return err.message; // Already user-friendly
    } else if (err.message.includes('auth')) {
      return 'Authentication failed. Please check your API credentials.';
    } else if (err.message.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    return 'Failed to generate content. Please try again.';
  }, []);

  /**
   * Generate content with error handling, rate limiting, and retry logic
   */
  const generateAIResponse = useCallback(async (prompt, options = {}) => {
    try {
      checkRateLimit();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await retryWithBackoff(() => 
        aiAPI.generate(prompt, options)
      );
      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return null;
      }
      
      const userMessage = getUserFriendlyError(err);
      if (import.meta.env.DEV) {
        console.error('AI Service Error:', err);
      }
      setError(userMessage);
      toast.error(userMessage);
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [checkRateLimit, retryWithBackoff, getUserFriendlyError]);

  /**
   * Generate structured JSON response with rate limiting and retry
   */
  const generateStructuredAIResponse = useCallback(async (prompt, schema, options = {}) => {
    try {
      checkRateLimit();
    } catch (err) {
      toast.error(err.message);
      throw err;
    }

    setIsLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await retryWithBackoff(() =>
        aiAPI.generateStructured(prompt, schema, options)
      );
      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }

      const userMessage = getUserFriendlyError(err);
      if (import.meta.env.DEV) {
        console.error('AI Service Error (Structured):', err);
      }
      setError(userMessage);
      toast.error(userMessage);
      throw err;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [checkRateLimit, retryWithBackoff, getUserFriendlyError]);

  /**
   * Stream content with real-time updates
   */
  const streamAIResponse = useCallback(async (prompt, options = {}) => {
    setIsLoading(true);
    setError(null);
    setStreamingText('');
    
    try {
      await aiAPI.stream(
        prompt,
        (chunk, fullText) => {
          setStreamingText(fullText);
          if (options.onChunk) {
            options.onChunk(chunk, fullText);
          }
        },
        options
      );
      
      return streamingText;
    } catch (err) {
      console.error('AI Streaming Error:', err);
      setError(err.message);
      toast.error('Failed to stream content. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [streamingText]);

  /**
   * Reset the streaming text
   */
  const resetStreaming = useCallback(() => {
    setStreamingText('');
  }, []);

  return {
    // State
    isLoading,
    error,
    streamingText,
    
    // Actions
    generateAIResponse,
    generateStructuredAIResponse,
    streamAIResponse,
    resetStreaming,
    cancelRequest,
  };
};

export default useAIService;
