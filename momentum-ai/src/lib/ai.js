/**
 * Unified AI Service - All API calls go through the server
 * 
 * @deprecated This hook is deprecated. Use the context-based `useAI` hook from `contexts/AIContext` instead.
 * This file will route through the context to maintain backward compatibility.
 * 
 * Migration: Replace `import { useAI } from '../lib/ai'` with `import { useAI } from '../contexts/AIContext'`
 */

import { useCallback } from 'react';
import { useContext } from 'react';
import { AIContext } from '../contexts/AIContext';
import { aiAPI } from './unifiedAPI';
import { toast } from 'sonner';

// Always use server API (recommended approach)
// API keys stay secure on the server side
const USE_SERVER_AI = true;

/**
 * Custom hook for AI content generation
 * @deprecated Use the context-based `useAI` from `contexts/AIContext` instead
 * This hook now routes through the context to ensure single behavior path
 */
export const useAI = () => {
  // Try to use context-based hook first (preferred)
  try {
    const context = useContext(AIContext);
    if (context) {
      // Map context methods to legacy API for backward compatibility
      return {
        generateContent: async (options = {}) => {
          if (!options.prompt) {
            throw new Error('Prompt is required');
          }
          return await context.generateContent(options.prompt, options);
        },
        generateStructuredContent: async (options = {}) => {
          if (!options.prompt || !options.schema) {
            throw new Error('Prompt and schema are required');
          }
          return await context.generateStructuredContent(options.prompt, options.schema, options);
        },
        streamContent: async (options = {}) => {
          if (!options.prompt) {
            throw new Error('Prompt is required');
          }
          return await context.streamContent(options.prompt, options.onChunk, options);
        },
        isGenerating: context.isGenerating,
      };
    }
  } catch (error) {
    // Context not available, fall back to direct API calls (legacy behavior)
    // This should only happen if component is not wrapped in AIProvider
    if (import.meta.env.DEV) {
      console.warn('useAI: AIContext not available, falling back to direct API calls. Wrap your app in AIProvider.');
    }
  }
  
  // Fallback to direct API implementation (for backward compatibility)
  // This maintains the old behavior but is deprecated
  /**
   * Generate content with AI
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to generate content from
   * @param {number} [options.maxTokens=2048] - Maximum tokens (mapped to maxOutputTokens)
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @param {string} [options.model='pro'] - Model type ('pro' or 'flash')
   * @returns {Promise<string>} - Generated content
   */
  const generateContent = useCallback(async (options = {}) => {
    const {
      prompt,
      maxTokens = 2048,
      temperature = 0.7,
      model = 'pro',
      ...otherOptions
    } = options;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      // Always use server API - API keys stay secure on server
      // Server handles model selection based on AI_PROVIDER (defaults to Ollama)
      return await aiAPI.generate(prompt, {
        model: model || undefined, // Let server use default Ollama model
        temperature,
        maxTokens,
        ...otherOptions,
      });
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Failed to generate content. Please try again.');
      throw error;
    }
  }, []);

  /**
   * Generate structured content with JSON schema
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt
   * @param {Object} options.schema - JSON schema for structured output
   * @param {number} [options.maxTokens=2048] - Maximum tokens
   * @param {number} [options.temperature=0.7] - Temperature
   * @param {string} [options.model='pro'] - Model type
   * @returns {Promise<Object>} - Parsed JSON response
   */
  const generateStructuredContent = useCallback(async (options = {}) => {
    const {
      prompt,
      schema,
      maxTokens = 2048,
      temperature = 0.7,
      model = 'pro',
      ...otherOptions
    } = options;

    if (!prompt || !schema) {
      throw new Error('Prompt and schema are required');
    }

    try {
      // Always use server API - API keys stay secure on server
      // Server handles model selection based on AI_PROVIDER (defaults to Ollama)
      return await aiAPI.generateStructured(prompt, schema, {
        model: model || undefined, // Let server use default Ollama model
        temperature,
        maxTokens,
        ...otherOptions,
      });
    } catch (error) {
      console.error('AI structured generation error:', error);
      toast.error(error.message || 'Failed to generate structured content. Please try again.');
      throw error;
    }
  }, []);

  /**
   * Stream content with real-time updates
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt
   * @param {Function} options.onChunk - Callback for each chunk
   * @param {number} [options.maxTokens=2048] - Maximum tokens
   * @param {number} [options.temperature=0.7] - Temperature
   * @param {string} [options.model='pro'] - Model type
   * @returns {Promise<string>} - Full generated content
   */
  const streamContent = useCallback(async (options = {}) => {
    const {
      prompt,
      onChunk,
      maxTokens = 2048,
      temperature = 0.7,
      model = 'pro',
      ...otherOptions
    } = options;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      // Always use server API streaming - API keys stay secure on server
      // Server handles model selection based on AI_PROVIDER (defaults to Ollama)
      return await aiAPI.stream(
        prompt,
        onChunk,
        {
          model: model || undefined, // Let server use default Ollama model
          temperature,
          maxTokens,
          ...otherOptions,
        }
      );
    } catch (error) {
      console.error('AI streaming error:', error);
      toast.error(error.message || 'Failed to stream content. Please try again.');
      throw error;
    }
  }, []);

  return {
    generateContent,
    generateStructuredContent,
    streamContent,
    isGenerating: false, // Can be enhanced with state if needed
  };
};

export default useAI;

