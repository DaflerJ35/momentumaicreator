import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCollaboration } from '../contexts/CollaborationContext';

/**
 * Hook to track cursor movement and broadcast it for collaboration
 * @param {boolean} enabled - Whether cursor tracking is enabled
 * @param {number} throttleMs - Throttle interval in milliseconds (default: 100ms)
 */
export const useCursorTracking = (enabled = true, throttleMs = 100) => {
  const { updateCursor } = useCollaboration();
  const location = useLocation();
  const lastUpdateRef = useRef(0);
  const pageIdRef = useRef(null);

  // Get current page ID from location
  useEffect(() => {
    pageIdRef.current = location.pathname;
  }, [location.pathname]);

  // Throttled cursor update function
  const handleMouseMove = useCallback(
    (e) => {
      if (!enabled || !updateCursor || !pageIdRef.current) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < throttleMs) {
        return;
      }

      lastUpdateRef.current = now;
      updateCursor(pageIdRef.current, e.clientX, e.clientY);
    },
    [enabled, updateCursor, throttleMs]
  );

  // Set up mouse move listener
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Add event listener with passive option for better performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, handleMouseMove]);

  // Clear cursor when leaving page or disabling
  useEffect(() => {
    if (!enabled && updateCursor && pageIdRef.current) {
      // Clear cursor by setting it to null or off-screen
      updateCursor(pageIdRef.current, -1, -1);
    }
  }, [enabled, updateCursor]);
};

export default useCursorTracking;

