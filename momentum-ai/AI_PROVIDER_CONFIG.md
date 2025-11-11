# AI Provider Configuration Guide

## Overview

Momentum AI supports multiple AI providers (Gemini and Ollama) with server-side processing for better security and control.

## Configuration

### Backend Configuration (`server/.env`)

#### Required Variables

```bash
# AI Provider (required)
# Options: 'gemini' or 'ollama'
AI_PROVIDER=ollama

# Default Model (optional)
AI_DEFAULT_MODEL=llama2
```

#### Ollama Configuration

**For Local Ollama:**
```bash
OLLAMA_URL=http://localhost:11434
# OLLAMA_API_KEY not required for local
```

**For Ollama Cloud:**
```bash
AI_PROVIDER=ollama
OLLAMA_URL=https://api.ollama.ai
OLLAMA_API_KEY=your_ollama_api_key_here
AI_DEFAULT_MODEL=llama2
```

#### Gemini Configuration

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend Configuration (`momentum-ai/.env`)

```bash
# Use server-side AI (recommended for production)
VITE_USE_SERVER_AI=true

# API URL (use same origin in production, localhost for development)
VITE_API_URL=http://localhost:3001
```

## Available Models

### Ollama Models

- `llama2` (default)
- `llama2:13b`
- `llama2:70b`
- `mistral`
- `mixtral`
- `codellama`
- `neural-chat`
- `starling-lm`

### Gemini Models

- `gemini-1.5-flash-latest` (default)
- `gemini-1.5-pro-latest`
- `gemini-pro-vision` (for image analysis)

## Model Validation

The server automatically validates model names and falls back to the default model if an invalid model is requested. This ensures compatibility across different provider configurations.

## Health Checks

The frontend performs health checks on startup to verify:
1. Backend AI service is available
2. Provider is properly configured
3. Models are available

Check the browser console for health check status.

## Troubleshooting

### Connection Issues

**Error: "Cannot connect to Ollama"**
- Ensure Ollama is running locally (`ollama serve`)
- Verify `OLLAMA_URL` is correct
- For cloud, check `OLLAMA_API_KEY` is set

**Error: "Gemini API key not configured"**
- Verify `GEMINI_API_KEY` is set in `server/.env`
- Check API key is valid in Google AI Studio

### Model Issues

**Error: "Invalid model"**
- Check available models for your provider
- Verify `AI_DEFAULT_MODEL` is a valid model name
- Server will automatically fall back to default if invalid model is requested

### Frontend Issues

**Error: "Backend AI service is not available"**
- Verify `VITE_USE_SERVER_AI=true` in frontend `.env`
- Check backend server is running on `VITE_API_URL`
- Verify CORS configuration allows frontend origin

## Single Source of Truth

**Backend `.env` file is the single source of truth for AI provider configuration.**

- Frontend `VITE_USE_SERVER_AI` should match backend availability
- Frontend queries `/api/ai/models` to get available models
- All AI requests go through the backend API

## Security Notes

- Never commit `.env` files with real API keys
- Rotate API keys if they are exposed
- Use environment variables in production (Vercel, Render, etc.)
- Enable secret scanning in CI/CD (see `.github/workflows/security-scan.yml`)
