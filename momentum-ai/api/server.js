// Vercel API route wrapper for the server
// This file is in the api/ directory which Vercel treats as serverless functions
// The root package.json has "type": "module", so this is ESM
// But the server uses CommonJS, so we need to use createRequire for compatibility

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load the Express app (CommonJS module) using createRequire
let app;

try {
  // Import the Express app (CommonJS module)
  // Using createRequire allows us to require() CommonJS modules in ESM context
  app = require('../server/server.js');
} catch (error) {
  console.error('Failed to load Express app:', error);
  console.error('Error stack:', error.stack);
  // Fallback handler if app fails to load
  app = null;
}

// Vercel serverless function handler
// Vercel passes (req, res) objects that are compatible with Express
export default function handler(req, res) {
  // If app failed to load, return error
  if (!app) {
    console.error('Express app not loaded - check server initialization');
    return res.status(500).json({ 
      error: 'Server initialization failed',
      message: 'Please check server logs in Vercel dashboard'
    });
  }

  // Delegate to Express app
  // Vercel's req/res are compatible with Express
  return app(req, res);
}
