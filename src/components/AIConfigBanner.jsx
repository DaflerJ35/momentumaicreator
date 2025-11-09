import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Dismissible banner that warns admins when AI provider/keys are misconfigured
 */
export default function AIConfigBanner({ error }) {
  const [dismissed, setDismissed] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState(null);

  // Reset dismissed state when error message changes (new error should be shown)
  useEffect(() => {
    if (error && error.message && error.message !== lastErrorMessage) {
      setDismissed(false);
      setLastErrorMessage(error.message);
    } else if (!error) {
      setLastErrorMessage(null);
      setDismissed(false);
    }
  }, [error, lastErrorMessage]);

  const handleDismiss = () => {
    setDismissed(true);
    // Don't clear the error from context - let health check handle that
    // Only hide the banner for this session
  };

  if (!error || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 p-4"
      >
        <Alert variant="warning" className="max-w-4xl mx-auto shadow-lg relative">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <AlertTitle>AI Provider Configuration Issue</AlertTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 -mt-1 -mr-1"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <AlertDescription>
                <p className="font-medium mb-2">{error.message}</p>
                {error.details && (
                  <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                    {error.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
                <p className="text-xs opacity-75">
                  Please check your server environment variables and ensure{' '}
                  <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                    AI_PROVIDER
                  </code>{' '}
                  and the required API keys are properly configured.
                </p>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}

