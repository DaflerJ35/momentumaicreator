/**
 * DEPRECATED: This file is kept for backward compatibility
 * NEW CODE SHOULD USE: import { aiAPI } from './unifiedAPI'
 * 
 * All API calls should go through the server via unifiedAPI.js
 * This ensures API keys stay secure on the server side
 */

// Only import Ajv if we're using direct API (not recommended)
let Ajv = null;
if (import.meta.env.VITE_USE_SERVER_API === 'false') {
  // Lazy import for JSON schema validation (only needed for direct API fallback)
  import('ajv').then(module => {
    Ajv = module.default;
  }).catch(() => {
    console.warn('Ajv not available for JSON schema validation');
  });
}

// Check if we should use server API (recommended) or direct calls
const USE_SERVER_API = import.meta.env.VITE_USE_SERVER_API !== 'false'; // Default to true

// Only initialize Gemini if we're not using server API (not recommended)
// This is kept for backward compatibility only
let genAI = null;
if (!USE_SERVER_API && import.meta.env.VITE_GEMINI_API_KEY) {
  // Lazy initialization - will be initialized when needed
  const initGemini = async () => {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      return new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    } catch (error) {
      console.warn('Gemini API not available, using server API instead');
      return null;
    }
  };
  
  // Initialize lazily when first needed
  const getGenAI = async () => {
    if (!genAI) {
      genAI = await initGemini();
    }
    return genAI;
  };
}

// Model configurations
const MODEL_CONFIG = {
  pro: 'gemini-1.5-pro-latest',
  flash: 'gemini-1.5-flash-latest',
  vision: 'gemini-pro-vision',
};

/**
 * Generate content using Gemini Pro model
 * @param {string} prompt - The input prompt
 * @param {Object} options - Additional options
 * @param {string} [options.model='pro'] - Model type ('pro' or 'flash')
 * @param {number} [options.temperature=0.7] - Temperature for generation
 * @param {number} [options.maxOutputTokens=2048] - Maximum tokens in the response
 * @returns {Promise<string>} - Generated content
 */
export const generateContent = async (prompt, {
  model = 'pro',
  temperature = 0.7,
  maxOutputTokens = 2048,
  jsonMode = false
} = {}) => {
  // Use server API by default (recommended)
  if (USE_SERVER_API) {
    const { aiAPI } = await import('./unifiedAPI');
    return await aiAPI.generate(prompt, {
      model: MODEL_CONFIG[model] || MODEL_CONFIG.pro,
      temperature,
      maxTokens: maxOutputTokens,
    });
  }

  // Fallback to direct API (only if explicitly enabled)
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please use server API or set VITE_GEMINI_API_KEY.');
  }

  try {
    const modelName = MODEL_CONFIG[model] || MODEL_CONFIG.pro;
    const genModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain',
      },
    });

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
};

/**
 * Generate content with a structured JSON response
 * @param {string} prompt - The input prompt
 * @param {Object} jsonSchema - JSON schema for the expected response
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const generateStructuredContent = async (prompt, jsonSchema, options = {}) => {
  // Use server API by default (recommended)
  if (USE_SERVER_API) {
    const { aiAPI } = await import('./unifiedAPI');
    return await aiAPI.generateStructured(prompt, jsonSchema, {
      model: options.model ? MODEL_CONFIG[options.model] || MODEL_CONFIG.pro : undefined,
      temperature: options.temperature,
      maxTokens: options.maxOutputTokens,
    });
  }

  // Fallback to direct API
  const schemaPrompt = `
  You are a helpful AI assistant that returns responses in JSON format.
  
  User's request: ${prompt}
  
  Respond with a valid JSON object that matches this schema:
  ${JSON.stringify(jsonSchema, null, 2)}
  
  Response (JSON only, no markdown or additional text):
  `;

  const response = await generateContent(schemaPrompt, {
    ...options,
    jsonMode: true,
  });

  try {
    let parsed;
    
    // First, try parsing the full response as JSON
    try {
      parsed = JSON.parse(response.trim());
    } catch (directParseError) {
      // If direct parse fails, try extracting from markdown code blocks
      const jsonMatch = response.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, response];
      const jsonString = jsonMatch[1] || jsonMatch[0] || response;
      
      try {
        parsed = JSON.parse(jsonString.trim());
      } catch (extractParseError) {
        // Try to repair common JSON issues (missing quotes, trailing commas, etc.)
        let repaired = jsonString.trim();
        
        // Remove markdown code block markers if still present
        repaired = repaired.replace(/^```(?:json)?\s*\n?/gm, '').replace(/\n?```\s*$/gm, '');
        
        // Try parsing repaired string
        try {
          parsed = JSON.parse(repaired);
        } catch (repairError) {
          // Last resort: provide detailed error
          console.error('JSON parsing failed:', {
            original: response.substring(0, 200),
            extracted: jsonString.substring(0, 200),
            errors: {
              direct: directParseError.message,
              extract: extractParseError.message,
              repair: repairError.message
            }
          });
          throw new Error(`Failed to parse AI response as valid JSON. The response may be malformed. Please try again. Error: ${repairError.message}`);
        }
      }
    }

    // Validate against schema if provided (only for direct API fallback)
    if (jsonSchema && typeof jsonSchema === 'object' && !USE_SERVER_API && Ajv) {
      try {
        const ajv = new Ajv();
        const validate = ajv.compile(jsonSchema);
        const valid = validate(parsed);
        
        if (!valid) {
          const errors = validate.errors || [];
          const errorMessages = errors.map(err => {
            const path = err.instancePath || 'root';
            return `${path}: ${err.message}`;
          }).join('; ');
          
          throw new Error(`JSON Schema validation failed: ${errorMessages}`);
        }
      } catch (validationError) {
        // If validation fails, log but don't block (server API handles validation)
        console.warn('Schema validation error:', validationError);
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw error.message.includes('Failed to parse') || error.message.includes('JSON Schema validation') ? error : new Error('Failed to parse AI response. Please try again.');
  }
};

/**
 * Generate content with streaming for real-time updates
 * @param {string} prompt - The input prompt
 * @param {Function} onChunk - Callback for each chunk of content
 * @param {Object} options - Additional options
 * @returns {Promise<void>}
 */
export const generateStreamingContent = async (prompt, onChunk, options = {}) => {
  // Use server API by default (recommended)
  if (USE_SERVER_API) {
    const { aiAPI } = await import('./unifiedAPI');
    return await aiAPI.stream(prompt, onChunk, {
      model: options.model ? MODEL_CONFIG[options.model] || MODEL_CONFIG.pro : undefined,
      temperature: options.temperature,
      maxTokens: options.maxOutputTokens,
    });
  }

  // Fallback to direct API
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please use server API or set VITE_GEMINI_API_KEY.');
  }

  try {
    const modelName = options.model === 'flash' ? MODEL_CONFIG.flash : MODEL_CONFIG.pro;
    const genModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 2048,
      },
    });

    const result = await genModel.generateContentStream(prompt);
    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      onChunk(chunkText, fullResponse);
    }
  } catch (error) {
    console.error('Error in streaming content generation:', error);
    throw new Error('Failed to generate streaming content. Please try again.');
  }
};

/**
 * Analyze image with Gemini Vision
 * @param {string} imageData - Base64 encoded image data
 * @param {string} prompt - The prompt for image analysis
 * @returns {Promise<string>} - Analysis result
 */
export const analyzeImage = async (imageData, prompt) => {
  // Use server API by default (recommended)
  if (USE_SERVER_API) {
    const { aiAPI } = await import('./unifiedAPI');
    return await aiAPI.analyzeImage(imageData, prompt);
  }

  // Fallback to direct API
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please use server API or set VITE_GEMINI_API_KEY.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_CONFIG.vision });
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
  } catch (error) {
    console.error('Error analyzing image with Gemini Vision:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

export default {
  generateContent,
  generateStructuredContent,
  generateStreamingContent,
  analyzeImage,
};
