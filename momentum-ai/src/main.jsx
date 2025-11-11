import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AIProvider, useAI } from './contexts/AIContext';
import { CollaborationProvider } from './contexts/CollaborationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalSearchProvider } from './contexts/GlobalSearchContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { getApiUrl } from './lib/utils';

/**
 * AI Provider Health Check Component
 * 
 * When VITE_USE_SERVER_AI=true, validates that the backend AI provider is properly configured.
 * Checks the /api/ai/models endpoint to ensure the backend has:
 * - AI_PROVIDER environment variable set
 * - Required provider API keys configured (GEMINI_API_KEY for Gemini, OLLAMA_URL for Ollama)
 * 
 * Single Source of Truth: Backend .env file controls AI provider configuration.
 * Frontend VITE_USE_SERVER_AI should match backend availability.
 */
function AIHealthCheck({ children }) {
  const { setAiConfigError } = useAI();

  React.useEffect(() => {
    const checkAIProviderHealth = async () => {
      // Only check if using server AI
      const useServerAI = import.meta.env.VITE_USE_SERVER_AI !== 'false';
      if (!useServerAI) {
        return; // Skip check if not using server AI
      }

      const API_URL = getApiUrl();
      
      // Create AbortController for timeout (5-10 seconds)
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, 8000); // 8 seconds timeout

      try {
        // Check AI provider availability via health endpoint
        // Use no-store cache policy to avoid stale responses
        const response = await fetch(`${API_URL}/api/ai/models`, {
          cache: 'no-store',
          signal: abortController.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorMessage = 'Backend AI service is not available or misconfigured.';
          const errorDetails = [
            'Backend server is not running',
            'Backend .env has AI_PROVIDER set (gemini or ollama)',
            'Required API keys are configured (GEMINI_API_KEY or OLLAMA_URL)',
            'VITE_USE_SERVER_AI matches backend availability'
          ];
          
          if (import.meta.env.DEV) {
            console.warn('⚠️ AI Provider Health Check Failed:', errorMessage);
          }
          
          setAiConfigError({
            message: errorMessage,
            details: errorDetails,
          });
          return;
        }

        const data = await response.json();
        if (!data.models || data.models.length === 0) {
          const errorMessage = `No AI models available. Current provider: ${data.provider || 'unknown'}`;
          const errorDetails = [
            'Check backend AI_PROVIDER configuration',
            'Verify API keys are properly set',
            'Ensure provider service is accessible'
          ];
          
          if (import.meta.env.DEV) {
            console.warn('⚠️ AI Provider Health Check: No models available.', errorMessage);
          }
          
          setAiConfigError({
            message: errorMessage,
            details: errorDetails,
          });
          return;
        }

        // Success - clear any previous errors
        setAiConfigError(null);
        
        if (import.meta.env.DEV) {
          console.log(
            `✅ AI Provider Health Check: ${data.provider || 'unknown'} provider available with ${data.models.length} model(s)`
          );
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Handle abort/timeout errors
        if (error.name === 'AbortError') {
          const errorMessage = 'AI provider health check timed out.';
          const errorDetails = [
            'Backend server may be slow or unresponsive',
            'Check network connectivity',
            'Verify backend server is running'
          ];
          
          if (import.meta.env.DEV) {
            console.warn('⚠️ AI Provider Health Check Timeout:', errorMessage);
          }
          
          setAiConfigError({
            message: errorMessage,
            details: errorDetails,
          });
          return;
        }
        
        // Show error in development, set error state for banner display
        const errorMessage = 'Could not verify backend AI provider availability.';
        const errorDetails = [
          'Backend server is not running',
          'CORS configuration issue',
          'Network connectivity problem'
        ];
        
        if (import.meta.env.DEV) {
          console.warn('⚠️ AI Provider Health Check Error:', errorMessage, error.message);
        }
        
        setAiConfigError({
          message: errorMessage,
          details: errorDetails,
        });
      }
    };

    // Run health check on mount (non-blocking)
    checkAIProviderHealth();
  }, [setAiConfigError]);

  return children;
}

// Performance monitoring
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log('Page Load Time:', pageLoadTime, 'ms');
      
      // Send to analytics if configured
      if (window.analytics) {
        window.analytics.track('page_load_time', {
          loadTime: pageLoadTime,
          url: window.location.href
        });
      }
    }

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (window.analytics) {
              window.analytics.track('web_vital', {
                name: entry.name,
                value: entry.value,
                id: entry.id,
                url: window.location.href
              });
            }
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        console.warn('PerformanceObserver not supported');
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <AIProvider>
              <AIHealthCheck>
                <CollaborationProvider>
                  <GlobalSearchProvider>
                    <NotificationProvider>
                      <App />
                    </NotificationProvider>
                  </GlobalSearchProvider>
                </CollaborationProvider>
              </AIHealthCheck>
            </AIProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
