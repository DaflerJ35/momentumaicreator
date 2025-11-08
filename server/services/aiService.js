/**
 * AI Service - Supports both Google Gemini and Ollama
 * Handles all AI operations server-side for better security and control
 */

const logger = require('../utils/logger');
const Ajv = require('ajv');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini'; // 'gemini' or 'ollama'
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.ollamaUrl = process.env.OLLAMA_URL || 'https://api.ollama.ai';
    this.ollamaApiKey = process.env.OLLAMA_API_KEY;
    this.defaultModel = process.env.AI_DEFAULT_MODEL || 'gemini-1.5-flash-latest';
    
    // Initialize Gemini if configured
    if (this.provider === 'gemini' && this.geminiKey) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(this.geminiKey);
      logger.info('AI Service initialized with Gemini');
    }
    
    // Initialize Ollama if configured
    if (this.provider === 'ollama' && this.ollamaUrl) {
      logger.info(`AI Service initialized with Ollama at ${this.ollamaUrl}`);
    }
  }

  /**
   * Generate content using the configured AI provider
   */
  async generateContent(prompt, options = {}) {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      provider = this.provider,
      jsonMode = false
    } = options;

    try {
      if (provider === 'ollama' || this.provider === 'ollama') {
        return await this.generateWithOllama(prompt, { model, temperature, maxTokens });
      } else {
        return await this.generateWithGemini(prompt, { model, temperature, maxTokens, jsonMode });
      }
    } catch (error) {
      logger.error('AI generation error:', { error: error.message, stack: error.stack });
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON content
   */
  async generateStructuredContent(prompt, schema, options = {}) {
    const schemaPrompt = `
You are a helpful AI assistant that returns responses in JSON format.

User's request: ${prompt}

Respond with a valid JSON object that matches this schema:
${JSON.stringify(schema, null, 2)}

Response (JSON only, no markdown or additional text):
    `;

    const response = await this.generateContent(schemaPrompt, {
      ...options,
      jsonMode: true
    });

    try {
      let parsed;
      
      // First, try parsing the full response as JSON
      try {
        parsed = JSON.parse(response.trim());
        // Basic validation: ensure it's an object/array
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Parsed JSON is not an object or array');
        }
      } catch (directParseError) {
        // If direct parse fails, try extracting from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, response];
        const jsonString = jsonMatch[1] || jsonMatch[0] || response;
        
        try {
          parsed = JSON.parse(jsonString.trim());
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Extracted JSON is not an object or array');
          }
        } catch (extractParseError) {
          // Try to repair common JSON issues
          let repaired = jsonString.trim();
          
          // Remove markdown code block markers if still present
          repaired = repaired.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
          
          // Try parsing repaired string
          try {
            parsed = JSON.parse(repaired);
            if (typeof parsed !== 'object' || parsed === null) {
              throw new Error('Repaired JSON is not an object or array');
            }
          } catch (repairError) {
            logger.error('JSON parsing failed after all attempts', {
              originalLength: response.length,
              extractedLength: jsonString.length,
              errors: {
                direct: directParseError.message,
                extract: extractParseError.message,
                repair: repairError.message
              }
            });
            
            // Provide structured error for UI
            const parseError = new Error(`Failed to parse AI response as valid JSON. The response may be malformed. ${repairError.message}`);
            parseError.name = 'JSONParseError';
            parseError.originalResponse = response.substring(0, 500);
            throw parseError;
          }
        }
      }

      // Validate against schema if provided
      if (schema && typeof schema === 'object') {
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(parsed);
        
        if (!valid) {
          const errors = validate.errors || [];
          const errorMessages = errors.map(err => {
            const path = err.instancePath || 'root';
            return `${path}: ${err.message}`;
          }).join('; ');
          
          const validationError = new Error(`JSON Schema validation failed: ${errorMessages}`);
          validationError.name = 'SchemaValidationError';
          throw validationError;
        }
      }
      
      return parsed;
    } catch (error) {
      logger.error('Error parsing JSON response:', error);
      // Re-throw structured errors as-is, wrap others
      if (error.name === 'JSONParseError' || error.name === 'SchemaValidationError') {
        throw error;
      }
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  /**
   * Generate content with streaming
   */
  async *generateStreamingContent(prompt, options = {}) {
    const {
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      provider = this.provider,
      jsonMode = false,
      signal
    } = options;

    try {
      if (provider === 'ollama' || this.provider === 'ollama') {
        yield* this.streamWithOllama(prompt, { model, temperature, maxTokens, signal });
      } else {
        yield* this.streamWithGemini(prompt, { model, temperature, maxTokens, jsonMode, signal });
      }
    } catch (error) {
      // Bypass wrapping for abort errors - let generator end quietly
      if (error.name === 'AbortError') {
        return;
      }
      // Don't log abort errors as they're expected when client disconnects
      if (signal?.aborted !== true) {
        logger.error('AI streaming error:', { error: error.message });
      }
      throw new Error(`Failed to stream content: ${error.message}`);
    }
  }

  /**
   * Generate with Google Gemini
   */
  async generateWithGemini(prompt, options = {}) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    const {
      model = 'gemini-1.5-flash-latest',
      temperature = 0.7,
      maxTokens = 2048,
      jsonMode = false
    } = options;

    const genModel = this.genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain',
      },
    });

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Stream with Google Gemini
   */
  async *streamWithGemini(prompt, options = {}) {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    const {
      model = 'gemini-1.5-flash-latest',
      temperature = 0.7,
      maxTokens = 2048,
      jsonMode = false,
      signal
    } = options;

    const generationConfig = {
      temperature,
      maxOutputTokens: maxTokens,
    };

    // Include responseMimeType when jsonMode is true
    if (jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    const genModel = this.genAI.getGenerativeModel({
      model: model,
      generationConfig,
    });

    const result = await genModel.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      // Check if abort signal was triggered
      if (signal?.aborted) {
        const abortError = new Error('Stream aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      yield chunk.text();
    }
  }

  /**
   * Generate with Ollama (Cloud)
   * 
   * Expected Ollama API format:
   * - Endpoint: POST /api/generate
   * - Request: { model, prompt, stream: false, options: { temperature, num_predict } }
   * - Response (non-streaming): { response: string, done: boolean, ... }
   * - Response (streaming): Newline-delimited JSON lines, each: { response: string, done: boolean, ... }
   * 
   * Note: Local Ollama servers may use different paths. Configure OLLAMA_URL appropriately.
   */
  async generateWithOllama(prompt, options = {}) {
    const {
      model = 'llama2',
      temperature = 0.7,
      maxTokens = 2048
    } = options;

    // Use node-fetch or built-in fetch (Node 18+)
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.ollamaApiKey && { 'Authorization': `Bearer ${this.ollamaApiKey}` })
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens
          }
        })
      });

      // Validate content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Unexpected content type from Ollama API: ${contentType}. Expected application/json.`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Ollama API: expected JSON object');
      }
      
      if (!data.response && data.done !== true) {
        logger.warn('Ollama response missing "response" field', { data });
      }
      
      return data.response || '';
    } catch (error) {
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        throw new Error(`Cannot connect to Ollama at ${this.ollamaUrl}. Ensure Ollama is running and OLLAMA_URL is correct.`);
      }
      throw error;
    }
  }

  /**
   * Stream with Ollama (Cloud)
   * 
   * Expected streaming format: Newline-delimited JSON (JSONL)
   * Each line is a JSON object: { response: string, done: boolean, ... }
   * Set OLLAMA_STREAM_FORMAT=jsonl (default) for this format.
   */
  async *streamWithOllama(prompt, options = {}) {
    const {
      model = 'llama2',
      temperature = 0.7,
      maxTokens = 2048,
      signal
    } = options;

    const streamFormat = process.env.OLLAMA_STREAM_FORMAT || 'jsonl';

    // Use node-fetch for streaming
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.ollamaApiKey && { 'Authorization': `Bearer ${this.ollamaApiKey}` })
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: true,
          options: {
            temperature,
            num_predict: maxTokens
          }
        }),
        signal // Pass abort signal to fetch
      });

      // Validate content type
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
        logger.warn(`Unexpected content type from Ollama streaming API: ${contentType}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Ollama API response does not support streaming');
      }

      const reader = response.body;
      let buffer = '';
      let lineCount = 0;

      for await (const chunk of reader) {
        // Check if abort signal was triggered
        if (signal?.aborted) {
          const abortError = new Error('Stream aborted');
          abortError.name = 'AbortError';
          throw abortError;
        }
        
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            lineCount++;
            try {
              const data = JSON.parse(line);
              
              // Validate response structure
              if (typeof data !== 'object') {
                logger.warn(`Invalid JSON line from Ollama (line ${lineCount}): expected object`, { line });
                continue;
              }
              
              if (data.response) {
                yield data.response;
              }
              
              if (data.done) {
                return; // Stream complete
              }
            } catch (e) {
              logger.warn(`Failed to parse JSON line from Ollama (line ${lineCount}): ${e.message}`, { line: line.substring(0, 100) });
              // Continue processing other lines
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.response) {
            yield data.response;
          }
        } catch (e) {
          logger.warn(`Failed to parse final buffer from Ollama: ${e.message}`);
        }
      }
    } catch (error) {
      // Preserve AbortError name when rethrowing
      if (error.name === 'AbortError' || signal?.aborted) {
        const abortError = new Error('Stream aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        throw new Error(`Cannot connect to Ollama at ${this.ollamaUrl}. Ensure Ollama is running and OLLAMA_URL is correct.`);
      }
      throw error;
    }
  }

  /**
   * Analyze image (Gemini Vision only for now)
   */
  async analyzeImage(imageData, prompt) {
    if (this.provider !== 'gemini') {
      throw new Error('Image analysis is currently only supported with Gemini');
    }

    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    const imageParts = [
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg',
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  }

  /**
   * Get available models for the current provider
   */
  getAvailableModels() {
    if (this.provider === 'ollama') {
      return [
        'llama2',
        'llama2:13b',
        'llama2:70b',
        'mistral',
        'mixtral',
        'codellama',
        'neural-chat',
        'starling-lm'
      ];
    } else {
      return [
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest',
        'gemini-pro-vision'
      ];
    }
  }
}

// Export singleton instance
module.exports = new AIService();

