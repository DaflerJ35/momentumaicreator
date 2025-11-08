/**
 * API Client Helper
 * Centralized helper for making authenticated API requests to the backend
 */

import { auth } from '../lib/firebase';

// Use relative paths in production (same domain), or VITE_API_URL if explicitly set
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is set and not localhost, use it
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  // In production or if VITE_API_URL is localhost, use relative paths (same domain)
  // This works with Vercel serverless functions
  return '';
};

const API_URL = getApiUrl();

/**
 * Get Firebase ID token for authentication
 */
async function getAuthToken() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return await currentUser.getIdToken();
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/multimedia/image/generate')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
  }

  return response;
}

/**
 * Make an authenticated API request with JSON response
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>}
 */
export async function apiRequestJson(endpoint, options = {}) {
  const response = await apiRequest(endpoint, options);
  return await response.json();
}

/**
 * Make an authenticated API request with FormData
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - FormData to send
 * @param {object} options - Additional fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequestFormData(endpoint, formData, options = {}) {
  const token = await getAuthToken();
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  // Don't set Content-Type for FormData, browser will set it with boundary
  delete headers['Content-Type'];

  const response = await fetch(url, {
    ...options,
    method: options.method || 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
  }

  return response;
}

