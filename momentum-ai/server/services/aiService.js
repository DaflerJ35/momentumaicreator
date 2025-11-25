/**
 * AI Service - Supports Google Gemini, Ollama, and Flowith/Neo
 * Handles all AI operations server-side for better security and control
 */

const logger = require('../utils/logger');
const Ajv = require('ajv');
const fetch = require('node-fetch');

const DEFAULT_OLLAMA_MODELS = [
  'llama3.1:8b-instruct',
  'mistral:7b-instruct',
  'mixtral:8x7b-instruct',
  'codellama:7b-instruct'
];

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'ollama'; // 'gemini', 'ollama', or 'flowith' - default to ollama for free usage
    this.geminiKey = process.env.GEMINI_API_KEY;
    // Default to local Ollama (free) - override with OLLAMA_URL env var for cloud or custom server
    // For local: http://localhost:11434 (requires Ollama installed locally)
    // For cloud: https://api.ollama.ai (requires OLLAMA_API_KEY)
    // Support both OLLAMA_URL (primary) and OLLAMA_API_URL (legacy/docs)
    this.ollamaUrl = process.env.OLLAMA_URL || process.env.OLLAMA_API_URL || 'http://localhost:11434';
    this.ollamaApiKey = process.env.OLLAMA_API_KEY;

    // Flowith / Neo Knowledge API configuration
    // FLOWITH_API_URL is expected to be the full Knowledge Retrieval endpoint base
    this.flowithBaseUrl = process.env.FLOWITH_API_URL || process.env.FLOWITH_BASE_URL || '';
    this.flowithApiKey = process.env.FLOWITH_API_KEY || '';
    this.flowithDefaultKb = process.env.FLOWITH_DEFAULT_KB || '';
    this.flowithDefaultModel = process.env.FLOWITH_DEFAULT_MODEL || process.env.AI_DEFAULT_MODEL || 'flowith-neo';

    // Align default model with modern Ollama defaults (for ollama provider)
    this.defaultModel = process.env.AI_DEFAULT_MODEL || 'llama3.1:8b-instruct';
    this.requiredModels = (process.env.OLLAMA_REQUIRED_MODELS || DEFAULT_OLLAMA_MODELS.join(','))
      .split(',')
      .map(model => model.trim())
      .filter(Boolean);
    if (this.requiredModels.length < 3) {
      for (const fallbackModel of DEFAULT_OLLAMA_MODELS) {
        if (this.requiredModels.length >= 3) break;
        if (!this.requiredModels.includes(fallbackModel)) {
          this.requiredModels.push(fallbackModel);
        }
      }
    }
    this.collaborativeModels = (process.env.OLLAMA_COLLAB_MODELS || '')
      .split(',')
      .map(model => model.trim())
      .filter(Boolean);
    if (!this.collaborativeModels.length) {
      this.collaborativeModels = [...this.requiredModels];
    }
    this.preloadPromise = null;
    this.preloadComplete = false;

    // Hybrid mode flags
    this.hybridMode = String(process.env.HYBRID_MODE || 'false').toLowerCase() === 'true';
    // Standardize OLLAMA_ROLE and warn on deprecated typo variants
    if (process.env.OLLABMA_ROLE || process.env.OLLLAMA_ROLE) {
      logger.warn('Deprecated env var detected: Use OLLAMA_ROLE only. OLLABMA_ROLE/OLLLAMA_ROLE are ignored.');
    }
    this.ollamaRole = process.env.OLLAMA_ROLE || 'assistant';
    this.hybridDefaultFlow = process.env.HYBRID_DEFAULT_FLOW || 'ollama-preprocess->gemini-synthesize';

    // Initialize Gemini if configured (always when key exists to enable hybrid regardless of provider)
    if (this.geminiKey) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.genAI = new GoogleGenerativeAI(this.geminiKey);
      if (this.provider === 'gemini') {
        logger.info('AI Service initialized with Gemini');
      } else if (this.hybridMode) {
        logger.info('AI Service hybrid mode enabled: Gemini client initialized for chaining');
      }
    }

    // Initialize Ollama if configured
    if (this.provider === 'ollama' && this.ollamaUrl) {
      logger.info(`AI Service initialized with Ollama at ${this.ollamaUrl}`);
      this.preloadPromise = this.preloadOllamaModels().catch(error => {
        logger.warn('Failed to preload Ollama models', { error: error.message });
      });
    }
  }

  /**
   * Generate content using the configured AI provider
   */
  async generateContent(prompt, options = {}) {
    const {
      model: requestedModel = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      provider = this.provider,
      jsonMode = false,
      signal,
      timeoutMs = 45000,
      messages,
      kbList,
    } = options;

    try {
      // Validate and normalize model name
      const model = this.validateModel(requestedModel, { fallbackToDefault: true });
      const providerToUse = provider || this.provider;

      if (providerToUse === 'flowith') {
        return await this.generateWithFlowith(prompt, {
          model,
          temperature,
          maxTokens,
          messages,
          kbList,
          jsonMode,
          signal,
          timeoutMs,
        });
      }

      if (providerToUse === 'ollama') {
        return await this.generateWithOllama(prompt, { model, temperature, maxTokens, signal });
      }

      // Default to Gemini when provider is not Ollama or Flowith
      return await this.generateWithGemini(prompt, { model, temperature, maxTokens, jsonMode, signal, timeoutMs });
    } catch (error) {
      // Preserve aborts so callers can distinguish
      if (error.name === 'AbortError') {
        const abortError = new Error(error.message || 'Operation aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      // Avoid noisy logs on expected aborts
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
   * Generate content using a hybrid flow across providers (e.g., Ollama -> Gemini)
   * Options:
   * - useOllamaFor: 'preprocess' | 'ideation' | 'none' (default 'preprocess')
   * - model: base model hint (defaults to this.defaultModel)
   * - geminiModel: override Gemini model for the second stage
   * - ollamaModel: override Ollama model for the first stage
   * - parallel: boolean (if true, run tasks in parallel and combine)
   */
  async generateHybridContent(prompt, options = {}) {
    const {
      useOllamaFor = 'preprocess',
      model = this.defaultModel,
      geminiModel = 'gemini-1.5-flash-latest',
      ollamaModel = 'llama3.1:8b-instruct',
      temperature = 0.7,
      maxTokens = 2048,
      parallel: parallelOption,
      jsonMode = false,
      signal: externalSignal,
      timeoutMs = 45000,
      provider: providedProvider,
      messages,
      kbList,
    } = options;

    const effectiveProvider = providedProvider || this.provider;

    // If Flowith is the active provider, treat hybrid requests as single-provider
    if (effectiveProvider === 'flowith') {
      return this.generateWithFlowith(prompt, {
        model,
        temperature,
        maxTokens,
        messages,
        kbList,
        jsonMode,
        signal: externalSignal,
        timeoutMs,
      });
    }

    // Preconditions: require at least one provider to be usable
    const geminiAvailable = !!this.genAI;
    const ollamaAvailable = !!this.ollamaUrl;

    if (!geminiAvailable && !ollamaAvailable) {
      throw new Error('No AI providers are configured for hybrid generation');
    }

    // Determine parallel mode from HYBRID_DEFAULT_FLOW when not explicitly provided
    const defaultParallel = /parallel/i.test(this.hybridDefaultFlow || '');
    const parallel = parallelOption ?? defaultParallel;

    // Build an AbortController that we can cancel on timeout or external signal
    const controller = new AbortController();
    const { signal } = controller;
    let timeoutId;

    // Propagate external aborts
    const onExternalAbort = () => {
      try { controller.abort(new Error('aborted')); } catch (_) { }
    };
    if (externalSignal) {
      if (externalSignal.aborted) {
        onExternalAbort();
      } else {
        externalSignal.addEventListener('abort', onExternalAbort, { once: true });
      }
    }

    // Timeout abort
    timeoutId = setTimeout(() => {
      try { controller.abort(new Error('timeout')); } catch (_) { }
    }, Math.max(1000, timeoutMs));

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    };

    const raceWithAbort = async (fn) => {
      if (signal.aborted) throw Object.assign(new Error('Operation aborted'), { name: 'AbortError' });
      try {
        const res = await fn();
        if (signal.aborted) throw Object.assign(new Error('Operation aborted'), { name: 'AbortError' });
        return res;
      } finally {
        // do not cleanup here; caller will cleanup after all stages
      }
    };

    try {
      // If parallel ideation/fact-checking
      if (parallel && geminiAvailable && ollamaAvailable) {
        const [ollamaOut, geminiOut] = await Promise.all([
          raceWithAbort(() => this.generateWithOllama(prompt, { model: ollamaModel || model, temperature, maxTokens, signal })),
          raceWithAbort(async () => {
            // Gemini SDK has no AbortSignal; emulate with periodic checks
            if (signal.aborted) throw Object.assign(new Error('Operation aborted'), { name: 'AbortError' });
            const result = await this.generateWithGemini(prompt, { model: geminiModel, temperature, maxTokens, jsonMode, signal, timeoutMs });
            if (signal.aborted) throw Object.assign(new Error('Operation aborted'), { name: 'AbortError' });
            return result;
          })
        ]);

        // Simple merge strategy: provide both with attribution
        return `Ollama draft:\n${ollamaOut}\n\nGemini draft:\n${geminiOut}\n\nSynthesis:\n${geminiOut}`;
      }

      // Default sequential chaining
      let context = prompt;

      // Stage 1: optionally run Ollama for preprocessing/ideation if available
      if (useOllamaFor !== 'none' && ollamaAvailable) {
        try {
          const ollamaResult = await raceWithAbort(() => this.generateWithOllama(prompt, {
            model: ollamaModel || model,
            maxTokens: Math.min(512, maxTokens),
            temperature: Math.min(0.9, Math.max(0.1, temperature))
            , signal
          }));
          const role = this.ollamaRole || 'assistant';
          context = `${prompt}\n\nPreprocessed by Ollama (${role}):\n${ollamaResult}`;
        } catch (e) {
          logger.warn(`Hybrid: Ollama stage failed, continuing with single-provider flow: ${e.message}`);
          // If Gemini is available, continue; else rethrow
          if (!geminiAvailable) throw e;
        }
      }

      // Stage 2: Gemini synthesis if available
      if (geminiAvailable) {
        const result = await raceWithAbort(async () => {
          // Wrap Gemini call with abort checks
          if (signal.aborted) throw Object.assign(new Error('Operation aborted'), { name: 'AbortError' });
          const out = await this.generateWithGemini(context, { model: geminiModel, temperature, maxTokens, jsonMode, signal, timeoutMs });
          if (signal.aborted) throw Object.assign(new Error('Operation aborted'), { name: 'AbortError' });
          return out;
        });
        return result;
      }

      // Fallback: only Ollama available
      return await raceWithAbort(() => this.generateWithOllama(context, { model: ollamaModel || model, temperature, maxTokens, signal }));
    } catch (error) {
      if (error.name === 'AbortError') {
        const abortError = new Error('Operation aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      logger.error('Hybrid generation failed:', { message: error.message });
      // Fallback to single provider logic
      return this.generateContent(prompt, { model, temperature, maxTokens, jsonMode, signal, timeoutMs });
    }
    finally {
      cleanup();
    }
  }

  /**
   * Generate content with streaming
   */
  async *generateStreamingContent(prompt, options = {}) {
    const {
      model: requestedModel = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      provider = this.provider,
      jsonMode = false,
      signal,
      messages,
      kbList,
    } = options;

    try {
      // Validate and normalize model name
      const model = this.validateModel(requestedModel, { fallbackToDefault: true });
      const providerToUse = provider || this.provider;

      if (providerToUse === 'flowith') {
        yield* this.streamWithFlowith(prompt, {
          model,
          temperature,
          maxTokens,
          messages,
          kbList,
          signal,
          jsonMode,
        });
      } else if (providerToUse === 'ollama') {
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
   * Generate with Flowith / Neo Knowledge API (non-streaming)
   * The FLOWITH_API_URL env var should point at the Knowledge Retrieval endpoint.
   * Request format:
   * - messages: [{ role, content }, ...]
   * - model: string
   * - kb_list: [kbId, ...]
   * - stream: false
   */
  async generateWithFlowith(prompt, options = {}) {
    if (!this.flowithBaseUrl || !this.flowithApiKey) {
      throw new Error('Flowith API not configured');
    }

    const {
      model = this.flowithDefaultModel,
      temperature = 0.7,
      maxTokens = 2048, // Reserved for future use if Flowith supports it
      messages,
      kbList,
      jsonMode = false,
      signal,
      timeoutMs = 45000,
    } = options;

    // Build conversation messages
    let payloadMessages;
    if (Array.isArray(messages) && messages.length > 0) {
      payloadMessages = messages
        .filter(m => m && typeof m.content === 'string')
        .map(m => ({
          role: typeof m.role === 'string' ? m.role : 'user',
          content: String(m.content).replace(/\0/g, '').trim(),
        }))
        .filter(m => m.content.length > 0);
    } else {
      const safePrompt = (prompt || '').toString().replace(/\0/g, '').trim();
      if (!safePrompt) {
        throw new Error('Prompt is required for Flowith requests');
      }
      payloadMessages = [{ role: 'user', content: safePrompt }];
    }

    // Normalize knowledge base list
    let kb_list = Array.isArray(kbList)
      ? kbList.map(id => String(id).trim()).filter(Boolean)
      : [];
    if (!kb_list.length && this.flowithDefaultKb) {
      kb_list = [this.flowithDefaultKb];
    }

    // Pre-abort check
    if (signal?.aborted) {
      const abortError = new Error('Operation aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }

    const body = {
      messages: payloadMessages,
      model,
      stream: false,
      kb_list: kb_list.length ? kb_list : undefined,
      temperature,
      // Allow callers to request JSON-like responses if desired
      response_format: jsonMode ? 'json' : 'text',
      max_tokens: maxTokens,
    };

    const run = async () => {
      const response = await fetch(this.flowithBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.flowithApiKey}`,
        },
        body: JSON.stringify(body),
        // We cannot combine an external AbortSignal with our own timeout signal,
        // so we rely on manual timeout handling below.
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok) {
        const errorPayload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');
        const errorMessage =
          (errorPayload && (errorPayload.error || errorPayload.message)) ||
          `Flowith API error (${response.status})`;
        throw new Error(errorMessage);
      }

      if (!isJson) {
        const text = await response.text();
        return text;
      }

      const data = await response.json();

      // Try to extract a primary text field from Flowith response
      if (typeof data === 'string') {
        return data;
      }

      if (data && typeof data === 'object') {
        if (typeof data.content === 'string') {
          return data.content;
        }
        if (typeof data.answer === 'string') {
          return data.answer;
        }
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          const last = data.messages[data.messages.length - 1];
          if (last && typeof last.content === 'string') {
            return last.content;
          }
        }
        if (data.result && typeof data.result === 'string') {
          return data.result;
        }
      }

      // Fallback: return JSON stringified payload
      return JSON.stringify(data);
    };

    // Execute with timeout handling similar to Gemini
    const withTimeout = new Promise((resolve, reject) => {
      const t = setTimeout(
        () => reject(Object.assign(new Error('Flowith request timed out'), { name: 'AbortError' })),
        Math.max(1000, timeoutMs)
      );
      run()
        .then(resolve, reject)
        .finally(() => clearTimeout(t));
    });

    try {
      const result = await withTimeout;
      if (signal?.aborted) {
        const abortError = new Error('Operation aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        const abortError = new Error(error.message || 'Operation aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      logger.error('Flowith generation error:', { error: error.message });
      throw new Error(`Failed to generate content with Flowith: ${error.message}`);
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
      jsonMode = false,
      signal,
      timeoutMs = 45000
    } = options;

    const genModel = this.genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain',
      },
    });

    // Pre-abort check
    if (signal?.aborted) {
      const abortError = new Error('Operation aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }

    // Execute with timeout and post-abort checks
    const run = () => genModel.generateContent(prompt);
    const withTimeout = new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(Object.assign(new Error('Gemini request timed out'), { name: 'AbortError' })), Math.max(1000, timeoutMs));
      run().then(resolve, reject).finally(() => clearTimeout(t));
    });

    const result = await withTimeout;
    if (signal?.aborted) {
      const abortError = new Error('Operation aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }
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
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      signal
    } = options;

    await this.ensureModelsReady();

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
        }),
        signal
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
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      signal
    } = options;

    const streamFormat = (process.env.OLLAMA_STREAM_FORMAT || 'jsonl').toLowerCase();

    await this.ensureModelsReady();

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

        if (streamFormat === 'text') {
          // Yield raw text chunks
          yield chunk.toString();
          continue;
        }

        // Default: jsonl
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
        if (streamFormat === 'text') {
          yield buffer;
        } else {
          try {
            const data = JSON.parse(buffer);
            if (data.response) {
              yield data.response;
            }
          } catch (e) {
            logger.warn(`Failed to parse final buffer from Ollama: ${e.message}`);
          }
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
   * Helper to ensure models are ready (if needed)
   */
  async ensureModelsReady() {
    if (this.preloadPromise) {
      await this.preloadPromise;
    }
  }

  /**
   * Preload Ollama models to ensure they are loaded in memory
   */
  async preloadOllamaModels() {
    if (this.preloadComplete) return;

    try {
      // Simple check to see if Ollama is reachable
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (response.ok) {
        this.preloadComplete = true;
      }
    } catch (error) {
      // Don't throw here, just log warning
      logger.warn(`Ollama not reachable at startup: ${error.message}`);
    }
  }

  /**
   * Stream with Flowith / Neo Knowledge API
   * Expected streaming format: newline-delimited JSON objects with a `tag` field.
   * Only human-readable message text is yielded to callers.
   */
  async *streamWithFlowith(prompt, options = {}) {
    if (!this.flowithBaseUrl || !this.flowithApiKey) {
      throw new Error('Flowith API not configured');
    }

    const {
      model = this.flowithDefaultModel,
      temperature = 0.7,
      maxTokens = 2048,
      messages,
      kbList,
      signal,
      jsonMode = false,
    } = options;

    // Build conversation messages
    let payloadMessages;
    if (Array.isArray(messages) && messages.length > 0) {
      payloadMessages = messages
        .filter(m => m && typeof m.content === 'string')
        .map(m => ({
          role: typeof m.role === 'string' ? m.role : 'user',
          content: String(m.content).replace(/\0/g, '').trim(),
        }))
        .filter(m => m.content.length > 0);
    } else {
      const safePrompt = (prompt || '').toString().replace(/\0/g, '').trim();
      if (!safePrompt) {
        throw new Error('Prompt is required for Flowith streaming');
      }
      payloadMessages = [{ role: 'user', content: safePrompt }];
    }

    // Normalize knowledge base list
    let kb_list = Array.isArray(kbList)
      ? kbList.map(id => String(id).trim()).filter(Boolean)
      : [];
    if (!kb_list.length && this.flowithDefaultKb) {
      kb_list = [this.flowithDefaultKb];
    }

    // Pre-abort check
    if (signal?.aborted) {
      const abortError = new Error('Stream aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }

    const body = {
      messages: payloadMessages,
      model,
      stream: true,
      kb_list: kb_list.length ? kb_list : undefined,
      temperature,
      response_format: jsonMode ? 'json' : 'text',
      max_tokens: maxTokens,
    };

    try {
      const response = await fetch(this.flowithBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.flowithApiKey}`,
        },
        body: JSON.stringify(body),
        signal,
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
        logger.warn(`Unexpected content type from Flowith streaming API: ${contentType}`);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Flowith streaming error (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Flowith API response does not support streaming');
      }

      const reader = response.body;
      let buffer = '';

      for await (const chunk of reader) {
        if (signal?.aborted) {
          const abortError = new Error('Stream aborted');
          abortError.name = 'AbortError';
          throw abortError;
        }

        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          let data;
          try {
            data = JSON.parse(trimmed);
          } catch (_) {
            // Skip non-JSON lines
            continue;
          }

          if (!data || typeof data !== 'object') continue;

          const tag = data.tag || data.type || data.event;
          const text =
            data.text ||
            data.content ||
            (Array.isArray(data.messages) && data.messages.length > 0
              ? data.messages[data.messages.length - 1]?.content
              : null);

          // Ignore purely internal tags like "searching" or "seeds" unless they contain useful text
          const informationalTags = new Set(['searching', 'seeds']);
          if (informationalTags.has(String(tag)) && !text) {
            continue;
          }

          if (typeof text === 'string' && text.trim()) {
            yield text;
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        const abortError = new Error(error.message || 'Stream aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }
      logger.error('Flowith streaming error:', { error: error.message });
      throw new Error(`Failed to stream content with Flowith: ${error.message}`);
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
  getAvailableModels(options = {}) {
    const { includeHybrid = false } = options;
    if (this.provider === 'ollama') {
      const models = [
        // Llama 3.1 family
        'llama3.1:8b-instruct',
        'llama3.1:70b-instruct',
        'llama3.1:405b-instruct',
        // Mistral/Mixtral
        'mistral:7b-instruct',
        'mixtral:8x7b-instruct',
        // Coding and others
        'codellama:7b-instruct',
        'phi3:3.8b-mini-instruct',
        'qwen2:7b-instruct'
      ];
      if (!includeHybrid) return models;
      return { provider: 'ollama', models, hybridSupported: !!this.genAI };
    }

    if (this.provider === 'flowith') {
      const envModels = process.env.FLOWITH_MODELS;
      const models = envModels
        ? envModels.split(',').map(m => m.trim()).filter(Boolean)
        : [this.flowithDefaultModel].filter(Boolean);
      if (!includeHybrid) return models;
      return { provider: 'flowith', models, hybridSupported: false };
    }

    const models = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-pro-vision'
    ];
    if (!includeHybrid) return models;
    return { provider: 'gemini', models, hybridSupported: !!this.ollamaUrl };
  }

  /**
   * Validate model name against available models for the current provider
   * Returns the validated model name, or falls back to default if invalid
   */
  validateModel(model, options = {}) {
    const { fallbackToDefault = true } = options;

    // Flowith models are often configured dynamically; accept any non-empty string
    if (this.provider === 'flowith') {
      if (!model) {
        if (fallbackToDefault) {
          const fallbackModel = this.flowithDefaultModel || this.defaultModel;
          logger.warn(`No model specified for Flowith, using default: ${fallbackModel}`);
          return fallbackModel;
        }
        throw new Error('Model is required for Flowith provider');
      }
      return model;
    }

    const availableModels = this.getAvailableModels();

    if (!model) {
      if (fallbackToDefault) {
        logger.warn(`No model specified, using default: ${this.defaultModel}`);
        return this.defaultModel;
      }
      throw new Error('Model is required');
    }

    // Check if model is in available models list
    if (availableModels.includes(model)) {
      return model;
    }

    // If model not found and fallback is enabled, use default
    if (fallbackToDefault) {
      logger.warn(`Model "${model}" not available for provider "${this.provider}", falling back to default: ${this.defaultModel}`);
      return this.defaultModel;
    }

    // Throw error if model is invalid and fallback is disabled
    throw new Error(`Invalid model "${model}" for provider "${this.provider}". Available models: ${availableModels.join(', ')}`);
  }

  /**
   * Provider-model mapping for validation
   * Maps provider to available models and their configurations
   */
  static getProviderModelMap() {
    return {
      ollama: {
        models: [
          'llama3.1:8b-instruct',
          'llama3.1:70b-instruct',
          'llama3.1:405b-instruct',
          'mistral:7b-instruct',
          'mixtral:8x7b-instruct',
          'codellama:7b-instruct',
          'phi3:3.8b-mini-instruct',
          'qwen2:7b-instruct'
        ],
        default: 'llama3.1:8b-instruct',
        supportsStreaming: true,
        supportsImageAnalysis: false,
      },
      gemini: {
        models: [
          'gemini-1.5-flash-latest',
          'gemini-1.5-pro-latest',
          'gemini-pro-vision'
        ],
        default: 'gemini-1.5-flash-latest',
        supportsStreaming: true,
        supportsImageAnalysis: true,
      },
      flowith: {
        models: (process.env.FLOWITH_MODELS || 'flowith-neo')
          .split(',')
          .map(m => m.trim())
          .filter(Boolean),
        default: process.env.FLOWITH_DEFAULT_MODEL || 'flowith-neo',
        supportsStreaming: true,
        supportsImageAnalysis: false,
      }
    };
  }

  /**
   * Generate multi-model collaborative content
   */

  /**
   * Generate multi-model collaborative content
   */
  async generateCollaborativeContent(prompt, options = {}) {
    if (this.provider !== 'ollama') {
      const fallback = await this.generateContent(prompt, options);
      return { final: fallback, steps: [], meta: null };
    }

    await this.ensureModelsReady();

    const phases = [
      { role: 'Strategist', instruction: 'Break down the request into a clear game plan and outline 3-5 actionable steps.' },
      { role: 'Creator', instruction: 'Produce the actual content following the strategist plan using a confident, helpful tone.' },
      { role: 'Optimizer', instruction: 'Review and upgrade the creator draft. Highlight improvements and ensure the message is compelling.' },
    ];

    const models = phases.map((_, index) => {
      return this.collaborativeModels[index % this.collaborativeModels.length] || this.defaultModel;
    });

    const steps = [];
    for (let index = 0; index < phases.length; index++) {
      const { role, instruction } = phases[index];
      const model = models[index];
      const rolePrompt = `
You are acting as the ${role} in a collaborative AI team.
Guidance: ${instruction}

User request:
${prompt}

Respond with clear ${role} output only.`;
      const result = await this.generateWithOllama(rolePrompt, {
        ...options,
        model,
      });
      steps.push({
        role,
        model,
        content: result?.trim() || '',
      });
    }

    const synthesisPrompt = `
You are the Orchestrator coordinating AI collaborators.
Combine the following collaborator outputs into a unified final answer.

${steps.map((step, idx) => `## ${idx + 1}. ${step.role} (${step.model})
${step.content}`).join('\n\n')}

Return a JSON object with:
- "strategy": short recap of the agreed plan
- "draft": the improved copy/content
- "optimization": bullets describing enhancements made
- "final_answer": polished final response for the user
`;

    const synthesis = await this.generateWithOllama(synthesisPrompt, {
      ...options,
      model: options.model || this.defaultModel,
      temperature: options.temperature ?? 0.6,
    });

    const parsed = this.safeJsonParse(synthesis);
    const final =
      (parsed && (parsed.final_answer || parsed.final || parsed.answer)) ||
      synthesis;

    return {
      final: typeof final === 'string' ? final.trim() : final,
      steps,
      meta: parsed || { raw: synthesis },
    };
  }

  async ensureModelsReady() {
    if (this.provider !== 'ollama') return;
    if (this.preloadComplete) return;
    if (!this.preloadPromise) {
      this.preloadPromise = this.preloadOllamaModels().catch(error => {
        logger.warn('Model preload failed', { error: error.message });
      });
    }
    try {
      await this.preloadPromise;
      this.preloadComplete = true;
      this.preloadPromise = null;
    } catch (error) {
      logger.warn('Model preload did not finish', { error: error.message });
      this.preloadPromise = null;
    }
  }

  async preloadOllamaModels() {
    if (!this.ollamaUrl || !this.requiredModels.length) {
      this.preloadComplete = true;
      return;
    }

    const installed = await this.fetchInstalledOllamaModels();
    for (const model of this.requiredModels) {
      await this.pullModelIfNeeded(model, installed);
      await this.warmupModel(model);
    }
    logger.info('Ollama models preloaded', { models: this.requiredModels });
  }

  async fetchInstalledOllamaModels() {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tags (${response.status})`);
      }
      const data = await response.json();
      const models = new Set(
        (data?.models || [])
          .map(item => item?.name)
          .filter(Boolean)
      );
      return models;
    } catch (error) {
      logger.warn('Unable to read Ollama tags', { error: error.message });
      return new Set();
    }
  }

  async pullModelIfNeeded(model, installedSet) {
    if (installedSet.has(model)) return;
    try {
      const response = await fetch(`${this.ollamaUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.ollamaApiKey && { Authorization: `Bearer ${this.ollamaApiKey}` }),
        },
        body: JSON.stringify({ model, stream: false }),
      });
      if (!response.ok) {
        throw new Error(`Pull request failed with status ${response.status}`);
      }
      await response.text();
      installedSet.add(model);
      logger.info('Pulled Ollama model', { model });
    } catch (error) {
      logger.warn('Unable to pull Ollama model', { model, error: error.message });
    }
  }

  async warmupModel(model) {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.ollamaApiKey && { Authorization: `Bearer ${this.ollamaApiKey}` }),
        },
        body: JSON.stringify({
          model,
          prompt: `You are warming up for Momentum AI. Reply with "READY" to confirm ${model} is loaded.`,
          stream: false,
          options: { temperature: 0.2, num_predict: 5 },
        }),
      });
      if (!response.ok) {
        throw new Error(`Warm-up failed (${response.status})`);
      }
      await response.text();
      logger.info('Warmed up Ollama model', { model });
    } catch (error) {
      logger.warn('Warm-up skipped', { model, error: error.message });
    }
  }

  safeJsonParse(payload) {
    if (!payload || typeof payload !== 'string') return null;
    try {
      return JSON.parse(payload);
    } catch (_) {
      return null;
    }
  }

}

// Export singleton instance
module.exports = new AIService();

