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

