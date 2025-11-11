// Vercel Serverless Function Entry Point
// This file routes all /api requests to the Express server

const path = require('path');

// Set up environment for server
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load environment variables if .env exists (for local development)
try {
  require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
} catch (e) {
  // .env file not found, use Vercel environment variables
}

// Vercel serverless functions need a handler export
// Import server after env setup
let app;
try {
  // Try to import the Express app
  // Note: server.js exports the app, but we need to handle it properly for Vercel
  const serverModule = require('../server/server.js');
  
  // If server.js exports the app directly, use it
  if (serverModule && typeof serverModule === 'function') {
    app = serverModule;
  } else if (serverModule && serverModule.default) {
    app = serverModule.default;
  } else {
    // Server might export app differently, try to get it
    app = serverModule;
  }
} catch (error) {
  console.error('Error loading server:', error);
  // Fallback: create a minimal Express app
  const express = require('express');
  app = express();
  app.get('/api/health', (req, res) => {
    res.json({ status: 'error', message: 'Server failed to load', error: error.message });
  });
}

// Vercel serverless function handler
module.exports = app;
