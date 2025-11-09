# AI Provider Configuration Guide

## Overview

This application uses a server-side AI service that supports multiple providers (Gemini, Ollama). The AI provider configuration is managed entirely on the backend, with the frontend connecting to the backend API for all AI operations.

## Single Source of Truth

**Backend Configuration (server/.env)** is the single source of truth for AI provider selection:
- `AI_PROVIDER`: Set to `gemini` or `ollama`
- Provider-specific keys:
  - Gemini: `GEMINI_API_KEY`
  - Ollama: `OLLAMA_URL`, `OLLAMA_API_KEY` (optional)

**Frontend Configuration (.env)**:
- `VITE_USE_SERVER_AI`: Set to `true` to use server AI (recommended), `false` to use client-side AI (not recommended)
- `VITE_API_URL`: Backend API URL (optional, defaults to same origin in production)

## Configuration Contract

When `VITE_USE_SERVER_AI=true`:
1. **Backend MUST have** `AI_PROVIDER` set in `server/.env`
2. **Backend MUST have** the corresponding provider API keys configured:
   - For Gemini: `GEMINI_API_KEY`
   - For Ollama: `OLLAMA_URL` (and optionally `OLLAMA_API_KEY`)
3. **Frontend will validate** provider availability on startup via `/api/ai/models` endpoint
4. **Health check** runs automatically and logs warnings if misconfigured

## Fallback Logic

- If backend AI provider is not configured, AI operations will fail with clear error messages
- Frontend health check detects misconfiguration and logs warnings in development
- In production, health check failures are logged but do not block app startup

## Health Check Endpoint

The frontend performs a health check on startup by calling `/api/ai/models`. This endpoint:
- Returns available models for the configured provider
- Indicates the current provider (`gemini` or `ollama`)
- Fails if provider is misconfigured or unavailable

## Setup Instructions

### For Gemini Provider:
```env
# server/.env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

### For Ollama Provider:
```env
# server/.env
AI_PROVIDER=ollama
OLLAMA_URL=https://api.ollama.ai
OLLAMA_API_KEY=your_ollama_api_key_here  # Optional
```

### Frontend Configuration:
```env
# .env
VITE_USE_SERVER_AI=true
VITE_API_URL=http://localhost:3001  # Only needed in development
```

## Verification

After configuration:
1. Start the backend server
2. Check console for health check message: `✅ AI Provider Health Check: [provider] provider available`
3. If misconfigured, you'll see warnings with specific guidance

## Troubleshooting

### "AI Provider Health Check Failed"
- Ensure backend server is running
- Verify `AI_PROVIDER` is set in `server/.env`
- Check that required API keys are configured
- Verify `VITE_USE_SERVER_AI=true` matches backend availability

### "No models available"
- Check provider API key is valid
- Verify provider service is accessible
- Check backend logs for initialization errors

### Health check errors in development
- Verify backend server is running on expected port
- Check CORS configuration allows frontend origin
- Verify network connectivity between frontend and backend

