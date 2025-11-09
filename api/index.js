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

// Import the Express app
const app = require('../server/server.js');

// Export as Vercel serverless function
// Vercel will automatically handle Express apps when exported directly
module.exports = app;

