/**
 * Unified AI Service - All API calls go through the server
 * This is the recommended way to use AI services
 */

import { useCallback } from 'react';
import { aiAPI } from './unifiedAPI';
import { toast } from 'sonner';

// Always use server API (recommended approach)
// API keys stay secure on the server side
const USE_SERVER_AI = true;

/**
 * Custom hook for AI content generation
 * Provides a simple API compatible with tools that expect useAI() hook
 */
export const useAI = () => {
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
      // Map model names: 'pro' -> 'gemini-1.5-pro-latest', 'flash' -> 'gemini-1.5-flash-latest'
      const modelMap = {
        'pro': 'gemini-1.5-pro-latest',
        'flash': 'gemini-1.5-flash-latest',
      };
      const mappedModel = modelMap[model] || model;
      
      return await aiAPI.generate(prompt, {
        model: mappedModel,
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
      // Map model names: 'pro' -> 'gemini-1.5-pro-latest', 'flash' -> 'gemini-1.5-flash-latest'
      const modelMap = {
        'pro': 'gemini-1.5-pro-latest',
        'flash': 'gemini-1.5-flash-latest',
      };
      const mappedModel = modelMap[model] || model;
      
      return await aiAPI.generateStructured(prompt, schema, {
        model: mappedModel,
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
      // Map model names: 'pro' -> 'gemini-1.5-pro-latest', 'flash' -> 'gemini-1.5-flash-latest'
      const modelMap = {
        'pro': 'gemini-1.5-pro-latest',
        'flash': 'gemini-1.5-flash-latest',
      };
      const mappedModel = modelMap[model] || model;
      
      return await aiAPI.stream(
        prompt,
        onChunk,
        {
          model: mappedModel,
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

