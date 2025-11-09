/**
 * Utility function to merge Tailwind CSS classes
 * Simple implementation that filters out falsy values and joins classes
 */
export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .flat()
    .map((cls) => (typeof cls === 'string' ? cls : ''))
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * Get API URL for server requests
 * Use relative paths in production (same domain), or VITE_API_URL if explicitly set
 */
export function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  // If VITE_API_URL is set and not localhost, use it
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  // In production or if VITE_API_URL is localhost, use relative paths (same domain)
  // This works with Vercel serverless functions
  return '';
}

