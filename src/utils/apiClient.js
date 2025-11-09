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
 * Get Firebase ID token for authentication with automatic refresh
 * Handles token expiration and refresh automatically
 */
async function getAuthToken(forceRefresh = false) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Get token (force refresh if requested)
    const token = await currentUser.getIdToken(forceRefresh);
    return token;
  } catch (error) {
    // If token refresh fails, user might need to re-authenticate
    if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-disabled') {
      throw new Error('Your session has expired. Please sign in again.');
    }
    throw error;
  }
}

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/multimedia/image/generate')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}) {
  let token;
  try {
    token = await getAuthToken();
  } catch (error) {
    // If token retrieval fails, redirect to login
    if (error.message.includes('authenticated') || error.message.includes('expired')) {
      window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
      throw error;
    }
    throw error;
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  let response = await fetch(url, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized - token might be expired, try refreshing
  if (response.status === 401) {
    try {
      // Try refreshing token once
      token = await getAuthToken(true); // Force refresh
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(url, {
        ...options,
        headers
      });
    } catch (refreshError) {
      // If refresh fails, redirect to login
      if (refreshError.message.includes('expired') || refreshError.message.includes('authenticated')) {
        window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
      }
      throw refreshError;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    // Don't expose sensitive error details
    const errorMessage = error.error || error.message || `Request failed: ${response.statusText}`;
    throw new Error(errorMessage);
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
  let token;
  try {
    token = await getAuthToken();
  } catch (error) {
    if (error.message.includes('authenticated') || error.message.includes('expired')) {
      window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
      throw error;
    }
    throw error;
  }
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  // Don't set Content-Type for FormData, browser will set it with boundary
  delete headers['Content-Type'];

  let response = await fetch(url, {
    ...options,
    method: options.method || 'POST',
    headers,
    body: formData
  });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401) {
    try {
      token = await getAuthToken(true); // Force refresh
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch(url, {
        ...options,
        method: options.method || 'POST',
        headers,
        body: formData
      });
    } catch (refreshError) {
      if (refreshError.message.includes('expired') || refreshError.message.includes('authenticated')) {
        window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
      }
      throw refreshError;
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const errorMessage = error.error || error.message || `Request failed: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response;
}

