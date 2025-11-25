const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { verifyFirebaseToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/security');
const AIService = require('../services/aiService');

// Initialize AI Service
const aiService = new AIService();

// Helper: choose auth/ratelimit for AI endpoints based on FREE_AI_MODE
const FREE_AI_MODE_ENABLED = String(process.env.FREE_AI_MODE ?? 'true').toLowerCase() === 'true';
const aiPreMiddleware = FREE_AI_MODE_ENABLED
    ? [aiLimiter] // Free mode: no auth, but strict rate limiting
    : [verifyFirebaseToken]; // Default: require auth

if (FREE_AI_MODE_ENABLED) {
    logger.info('AI routes running in FREE mode with strict rate limiting');
}

/**
 * Generate content
 * POST /api/ai/generate
 */
router.post('/generate', ...aiPreMiddleware, async (req, res) => {
    const { prompt, model, temperature, maxTokens, provider, collaborative, messages, kbList, kb_list } = req.body;
    const useCollaborative = typeof collaborative === 'string'
        ? collaborative.toLowerCase() === 'true'
        : Boolean(collaborative);

    try {
        // Input validation and sanitization
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string' });
        }

        // Sanitize prompt - remove null bytes and trim
        const sanitizedPrompt = prompt.replace(/\0/g, '').trim();

        if (sanitizedPrompt.length === 0) {
            return res.status(400).json({ error: 'Prompt cannot be empty' });
        }

        // Sanitize prompt length
        if (sanitizedPrompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt is too long. Maximum length is 10,000 characters.' });
        }

        // Validate temperature if provided
        if (temperature !== undefined) {
            const temp = parseFloat(temperature);
            if (isNaN(temp) || temp < 0 || temp > 2) {
                return res.status(400).json({ error: 'Temperature must be a number between 0 and 2' });
            }
        }

        // Validate maxTokens if provided
        if (maxTokens !== undefined) {
            const tokens = parseInt(maxTokens);
            if (isNaN(tokens) || tokens < 1 || tokens > 8000) {
                return res.status(400).json({ error: 'Max tokens must be a number between 1 and 8000' });
            }
        }

        // Validate provider if provided
        if (provider && typeof provider !== 'string') {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Validate model if provided
        if (model && typeof model !== 'string') {
            return res.status(400).json({ error: 'Invalid model' });
        }

        // Optional Flowith-style conversation messages
        let sanitizedMessages;
        if (messages !== undefined) {
            if (!Array.isArray(messages)) {
                return res.status(400).json({ error: 'messages must be an array of { role, content } objects' });
            }

            sanitizedMessages = messages
                .filter((m) => m && typeof m.content === 'string')
                .slice(0, 20) // limit history depth
                .map((m) => ({
                    role: typeof m.role === 'string' ? m.role : 'user',
                    content: String(m.content).replace(/\0/g, '').trim().slice(0, 4000),
                }))
                .filter((m) => m.content.length > 0);

            if (!sanitizedMessages.length) {
                sanitizedMessages = undefined;
            }
        }

        // Optional Flowith knowledge base list (kbList or kb_list)
        const rawKbList = kbList || kb_list;
        let normalizedKbList;
        if (rawKbList !== undefined) {
            if (!Array.isArray(rawKbList)) {
                return res.status(400).json({ error: 'kbList must be an array of knowledge base IDs' });
            }

            normalizedKbList = rawKbList
                .map((id) => String(id).trim())
                .filter(Boolean)
                .slice(0, 20);

            if (!normalizedKbList.length) {
                normalizedKbList = undefined;
            }
        }

        // Setup abort/timeout to cancel upstream AI call if client disconnects or it runs too long
        const abortController = new AbortController();
        const ROUTE_TIMEOUT_MS = 60000; // 60s safety timeout
        let timedOut = false;

        const onClose = () => {
            try { abortController.abort(); } catch (_) { }
        };
        req.on('close', onClose);
        res.on('close', onClose);
        const timeoutId = setTimeout(() => { timedOut = true; try { abortController.abort(); } catch (_) { } }, ROUTE_TIMEOUT_MS);

        const cleanup = () => {
            clearTimeout(timeoutId);
            req.off('close', onClose);
            res.off('close', onClose);
        };

        let responsePayload;
        try {
            if (useCollaborative) {
                responsePayload = await aiService.generateCollaborativeContent(sanitizedPrompt, {
                    model: model || undefined,
                    temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
                    maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
                    provider: provider || undefined,
                    messages: sanitizedMessages,
                    kbList: normalizedKbList,
                    signal: abortController.signal,
                    timeoutMs: ROUTE_TIMEOUT_MS
                });
            } else {
                responsePayload = await aiService.generateContent(sanitizedPrompt, {
                    model: model || undefined,
                    temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
                    maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
                    provider: provider || undefined,
                    messages: sanitizedMessages,
                    kbList: normalizedKbList,
                    signal: abortController.signal,
                    timeoutMs: ROUTE_TIMEOUT_MS
                });
            }
        } catch (err) {
            cleanup();
            if (err.name === 'AbortError') {
                // If client closed or timeout, end quietly or report 499/408
                if (!res.headersSent && !res.writableEnded) {
                    const code = timedOut ? 408 : 499; // 408 Request Timeout or 499 Client Closed Request (non-standard)
                    return res.status(code).json({ error: timedOut ? 'Request timed out' : 'Request cancelled' });
                }
                return;
            }
            throw err;
        }

        cleanup();
        if (!res.writableEnded) {
            if (useCollaborative) {
                res.json({
                    content: responsePayload?.final,
                    collaborators: responsePayload?.steps || [],
                    synthesis: responsePayload?.meta || null
                });
            } else {
                res.json({ content: responsePayload });
            }
        }
    } catch (error) {
        // Log full error details for debugging (server-side only)
        logger.error('AI generation error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.uid
        });
        // Don't expose technical error details to users
        res.status(500).json({ error: 'Failed to generate content. Please try again.' });
    }
});

/**
 * Generate structured content (JSON)
 * POST /api/ai/generate-structured
 */
router.post('/generate-structured', ...aiPreMiddleware, async (req, res) => {
    const { prompt, schema, model, temperature, maxTokens, provider } = req.body;

    try {
        // Input validation and sanitization
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string' });
        }

        // Sanitize prompt
        const sanitizedPrompt = prompt.replace(/\0/g, '').trim();

        if (sanitizedPrompt.length === 0) {
            return res.status(400).json({ error: 'Prompt cannot be empty' });
        }

        if (sanitizedPrompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt is too long. Maximum length is 10,000 characters.' });
        }

        if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
            return res.status(400).json({ error: 'Schema is required and must be a valid object' });
        }

        // Validate schema is not too large (prevent DoS)
        const schemaString = JSON.stringify(schema);
        if (schemaString.length > 50000) {
            return res.status(400).json({ error: 'Schema is too large. Maximum size is 50KB.' });
        }

        // Validate temperature if provided
        if (temperature !== undefined) {
            const temp = parseFloat(temperature);
            if (isNaN(temp) || temp < 0 || temp > 2) {
                return res.status(400).json({ error: 'Temperature must be a number between 0 and 2' });
            }
        }

        // Validate maxTokens if provided
        if (maxTokens !== undefined) {
            const tokens = parseInt(maxTokens);
            if (isNaN(tokens) || tokens < 1 || tokens > 8000) {
                return res.status(400).json({ error: 'Max tokens must be a number between 1 and 8000' });
            }
        }

        // Setup abort/timeout similar to non-structured route
        const abortController = new AbortController();
        const ROUTE_TIMEOUT_MS = 60000; // 60s safety timeout
        let timedOut = false;

        const onClose = () => {
            try { abortController.abort(); } catch (_) { }
        };
        req.on('close', onClose);
        res.on('close', onClose);
        const timeoutId = setTimeout(() => { timedOut = true; try { abortController.abort(); } catch (_) { } }, ROUTE_TIMEOUT_MS);

        const cleanup = () => {
            clearTimeout(timeoutId);
            req.off('close', onClose);
            res.off('close', onClose);
        };

        let response;
        try {
            response = await aiService.generateStructuredContent(sanitizedPrompt, schema, {
                model: model || undefined,
                temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
                maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
                provider: provider || undefined,
                signal: abortController.signal,
                timeoutMs: ROUTE_TIMEOUT_MS
            });
        } catch (err) {
            cleanup();
            if (err.name === 'AbortError') {
                if (!res.headersSent && !res.writableEnded) {
                    const code = timedOut ? 408 : 499;
                    return res.status(code).json({ error: timedOut ? 'Request timed out' : 'Request cancelled' });
                }
                return;
            }
            throw err;
        }

        cleanup();
        if (!res.writableEnded) {
            res.json({ data: response });
        }
    } catch (error) {
        // Log full error details for debugging (server-side only)
        logger.error('AI structured generation error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.uid
        });
        // Don't expose technical error details to users
        res.status(500).json({ error: 'Failed to generate structured content. Please try again.' });
    }
});

/**
 * Stream content (Server-Sent Events)
 * POST /api/ai/stream
 */
router.post('/stream', ...aiPreMiddleware, async (req, res) => {
    const { prompt, model, temperature, maxTokens, provider, jsonMode } = req.body;

    try {
        // Input validation and sanitization
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string' });
        }

        // Sanitize prompt
        const sanitizedPrompt = prompt.replace(/\0/g, '').trim();

        if (sanitizedPrompt.length === 0) {
            return res.status(400).json({ error: 'Prompt cannot be empty' });
        }

        // Sanitize prompt length
        if (sanitizedPrompt.length > 10000) {
            return res.status(400).json({ error: 'Prompt is too long. Maximum length is 10,000 characters.' });
        }

        // Validate temperature if provided
        if (temperature !== undefined) {
            const temp = parseFloat(temperature);
            if (isNaN(temp) || temp < 0 || temp > 2) {
                return res.status(400).json({ error: 'Temperature must be a number between 0 and 2' });
            }
        }

        // Validate maxTokens if provided
        if (maxTokens !== undefined) {
            const tokens = parseInt(maxTokens);
            if (isNaN(tokens) || tokens < 1 || tokens > 8000) {
                return res.status(400).json({ error: 'Max tokens must be a number between 1 and 8000' });
            }
        }

        // Validate provider if provided
        if (provider && typeof provider !== 'string') {
            return res.status(400).json({ error: 'Invalid provider' });
        }

        // Validate model if provided
        if (model && typeof model !== 'string') {
            return res.status(400).json({ error: 'Invalid model' });
        }

        // Set up SSE headers for Vercel serverless compatibility
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
        res.setHeader('Transfer-Encoding', 'chunked');

        // Flush headers immediately (critical for Vercel)
        res.flushHeaders();

        // Track client disconnection
        let clientClosed = false;
        res.on('close', () => {
            clientClosed = true;
        });

        // Create AbortController for upstream cancellation
        const abortController = new AbortController();

        // Heartbeat interval - send comment line every 15 seconds to keep connection alive
        // Vercel serverless functions need more frequent heartbeats
        const HEARTBEAT_INTERVAL = 15000; // 15 seconds (reduced for Vercel)
        const heartbeatInterval = setInterval(() => {
            if (clientClosed) {
                clearInterval(heartbeatInterval);
                return;
            }
            try {
                // Send SSE comment line (keeps connection alive, ignored by EventSource)
                res.write(': heartbeat\n\n');
                // Force flush in Vercel environment
                if (res.flush && typeof res.flush === 'function') {
                    res.flush();
                }
            } catch (e) {
                // Connection closed, stop heartbeat
                clearInterval(heartbeatInterval);
                clientClosed = true;
            }
        }, HEARTBEAT_INTERVAL);

        // Maximum stream duration - abort after 5 minutes to prevent indefinite connections
        const MAX_STREAM_DURATION = 300000; // 5 minutes
        const maxDurationTimeout = setTimeout(() => {
            if (!clientClosed) {
                logger.warn('AI stream exceeded maximum duration, aborting', { duration: MAX_STREAM_DURATION });
                abortController.abort();
                clientClosed = true;
                clearInterval(heartbeatInterval);
                res.write(`data: ${JSON.stringify({ error: 'Stream timeout: maximum duration exceeded', done: true })}\n\n`);
                res.end();
            }
        }, MAX_STREAM_DURATION);

        // Cleanup function to clear all timers
        const cleanup = () => {
            clearInterval(heartbeatInterval);
            clearTimeout(maxDurationTimeout);
        };

        try {
            for await (const chunk of aiService.generateStreamingContent(sanitizedPrompt, {
                model: model || undefined,
                temperature: temperature !== undefined ? parseFloat(temperature) : undefined,
                maxTokens: maxTokens !== undefined ? parseInt(maxTokens) : undefined,
                provider: provider || undefined,
                jsonMode: jsonMode || false,
                signal: abortController.signal
            })) {
                // Check if client disconnected before writing
                if (clientClosed) {
                    abortController.abort();
                    cleanup();
                    return;
                }

                try {
                    res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
                    // Force flush after each chunk in Vercel environment
                    if (res.flush && typeof res.flush === 'function') {
                        res.flush();
                    }
                } catch (writeError) {
                    // Client disconnected during write
                    logger.warn('Client disconnected during stream write', { error: writeError.message });
                    abortController.abort();
                    cleanup();
                    return;
                }
            }

            // Check again before sending final message
            if (clientClosed) {
                cleanup();
                return;
            }

            // Clear timers on successful completion
            cleanup();
            res.write(`data: ${JSON.stringify({ chunk: '', done: true })}\n\n`);
            res.end();
        } catch (error) {
            // Clear timers on error
            cleanup();

            // Don't write error if client already disconnected
            if (clientClosed) {
                return;
            }

            // Don't expose technical error details in SSE stream
            res.write(`data: ${JSON.stringify({ error: 'Failed to stream content', done: true })}\n\n`);
            res.end();
        }
    } catch (error) {
        // Log full error details for debugging (server-side only)
        logger.error('AI streaming error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.uid
        });
        // Don't expose technical error details to users
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to stream content. Please try again.' });
        }
    }
});

/**
 * Analyze image
 * POST /api/ai/analyze-image
 */
router.post('/analyze-image', ...aiPreMiddleware, async (req, res) => {
    const { imageData, prompt } = req.body;

    try {
        // Input validation and sanitization
        if (!imageData || typeof imageData !== 'string') {
            return res.status(400).json({ error: 'Image data is required and must be a valid string' });
        }

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required and must be a string' });
        }

        // Sanitize prompt
        const sanitizedPrompt = prompt.replace(/\0/g, '').trim();

        if (sanitizedPrompt.length === 0) {
            return res.status(400).json({ error: 'Prompt cannot be empty' });
        }

        // Sanitize prompt length
        if (sanitizedPrompt.length > 1000) {
            return res.status(400).json({ error: 'Prompt is too long. Maximum length is 1,000 characters.' });
        }

        // Validate image data format (basic check)
        if (!imageData.startsWith('data:image/') && !imageData.startsWith('http://') && !imageData.startsWith('https://')) {
            return res.status(400).json({ error: 'Invalid image data format' });
        }

        // Validate URL if it's a URL (prevent SSRF)
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
            try {
                const url = new URL(imageData);
                // Block private IPs and localhost
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.startsWith('192.168.') || url.hostname.startsWith('10.') || url.hostname.startsWith('172.')) {
                    return res.status(400).json({ error: 'Invalid image URL' });
                }
            } catch (urlError) {
                return res.status(400).json({ error: 'Invalid image URL format' });
            }
        }

        const response = await aiService.analyzeImage(imageData, sanitizedPrompt);
        res.json({ analysis: response });
    } catch (error) {
        // Log full error details for debugging (server-side only)
        logger.error('AI image analysis error', {
            error: error.message,
            stack: error.stack,
            userId: req.user?.uid
        });
        // Don't expose technical error details to users
        res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
    }
});

/**
 * Get available models - PUBLIC endpoint (no auth required)
 * GET /api/ai/models
 */
router.get('/models', (req, res) => {
    try {
        const models = aiService.getAvailableModels();
        const providerMap = aiService.constructor.getProviderModelMap();
        const providerInfo = providerMap[aiService.provider] || {};

        res.json({
            models,
            provider: aiService.provider,
            defaultModel: aiService.defaultModel,
            supportsStreaming: providerInfo.supportsStreaming || false,
            supportsImageAnalysis: providerInfo.supportsImageAnalysis || false,
            providerMap: providerMap // Include full provider map for client reference
        });
    } catch (error) {
        // Log full error details for debugging
        logger.error('Error getting models', { error: error.message, stack: error.stack });
        // Don't expose technical error details to users
        res.status(500).json({ error: 'Failed to get available models. Please try again.' });
    }
});

module.exports = router;
