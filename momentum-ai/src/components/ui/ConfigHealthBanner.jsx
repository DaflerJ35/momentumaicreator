import { AlertCircle, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useConfigHealth } from '../../hooks/useConfigHealth';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/**
 * Banner component to display configuration health issues
 * Shows warnings/errors for missing or misconfigured services
 */
export function ConfigHealthBanner() {
  const health = useConfigHealth();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if loading, no issues, or dismissed
  if (health.loading || health.issues.length === 0 || dismissed) {
    return null;
  }

  // Filter to show only errors and critical warnings
  const criticalIssues = health.issues.filter(
    issue => issue.severity === 'error' || issue.severity === 'warning'
  );

  if (criticalIssues.length === 0) {
    return null;
  }

  const hasErrors = criticalIssues.some(issue => issue.severity === 'error');
  const bgColor = hasErrors ? 'bg-red-900/20 border-red-800/50' : 'bg-yellow-900/20 border-yellow-800/50';
  const textColor = hasErrors ? 'text-red-400' : 'text-yellow-400';
  const Icon = hasErrors ? AlertCircle : AlertTriangle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-0 left-0 right-0 z-50 ${bgColor} border-b ${textColor} px-4 py-3`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {hasErrors ? 'Configuration Issues Detected' : 'Configuration Warnings'}
              </p>
              <ul className="text-xs mt-1 space-y-1">
                {criticalIssues.map((issue, idx) => (
                  <li key={idx}>• {issue.message}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="ml-4 text-current hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Inline health indicator for specific services
 */
export function ConfigHealthIndicator({ service }) {
  const health = useConfigHealth();

  if (health.loading) {
    return null;
  }

  const isHealthy = health[service];
  const issue = health.issues.find(i => i.type === service);

  if (isHealthy && !issue) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle className="h-3 w-3" />
        {service} configured
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
      <AlertTriangle className="h-3 w-3" />
      {issue?.message || `${service} not configured`}
    </span>
  );
}

