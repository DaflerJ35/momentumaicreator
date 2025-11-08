import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error tracking service (e.g., Sentry, LogRocket)
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        },
        tags: {
          errorBoundary: true,
          errorId: this.state.errorId
        }
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        errorId={this.state.errorId}
        onReset={this.handleReset}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, errorId, onReset }) => {
  // Use window.location for navigation to avoid hook issues
  const navigateTo = (path) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 cosmic-bg relative">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="galaxy-bg" />
        <div className="stars-layer" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-morphism border border-red-500/30 rounded-2xl p-8 shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 rounded-full bg-red-500/20 border border-red-500/50">
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold text-white text-center mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-slate-400 text-center mb-8">
            We've been notified about this error and are working on a fix.
            {errorId && (
              <span className="block mt-2 text-sm">
                Error ID: <code className="bg-slate-800/50 px-2 py-1 rounded">{errorId}</code>
              </span>
            )}
          </p>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <details className="text-sm">
                <summary className="text-red-400 cursor-pointer font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-slate-300 overflow-auto max-h-48 mt-2">
                  {error.toString()}
                  {errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      Component Stack:
                      {errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onReset}
              className="bg-gradient-to-r from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)] hover:from-[hsl(280,85%,60%)] hover:to-[hsl(320,90%,55%)] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => navigateTo('/dashboard')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              If this problem persists, please contact support with the Error ID above.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorBoundary;

