import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Global Loading Indicator
 * Shows when any API request is in progress
 */
let activeRequests = 0;
const listeners = new Set();

export function setLoading(isLoading) {
  if (isLoading) {
    activeRequests++;
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
  }
  listeners.forEach(listener => listener());
}

export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(() => activeRequests > 0);

  useEffect(() => {
    const listener = () => setIsLoading(activeRequests > 0);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return isLoading;
}

export default function GlobalLoadingIndicator() {
  const isLoading = useGlobalLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="h-1 bg-slate-800/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear'
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

