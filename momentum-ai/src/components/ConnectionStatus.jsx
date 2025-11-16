import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { healthCheck } from '../lib/unifiedAPI';
import { cn } from '../lib/utils';

/**
 * Connection Status Indicator
 * Shows real-time connection health to backend API
 */
export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking'); // 'online' | 'offline' | 'checking' | 'degraded'
  const [lastCheck, setLastCheck] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const checkConnection = async () => {
      try {
        const result = await Promise.race([
          healthCheck(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        if (!mounted) return;
        
        if (result.status === 'ok') {
          setStatus('online');
        } else {
          setStatus('degraded');
        }
        setLastCheck(new Date());
      } catch (error) {
        if (!mounted) return;
        setStatus('offline');
        setLastCheck(new Date());
      }
    };

    // Initial check
    checkConnection();

    // Check every 30 seconds
    intervalId = setInterval(checkConnection, 30000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const statusConfig = {
    online: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      label: 'Connected',
      description: 'All systems operational'
    },
    offline: {
      icon: WifiOff,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      label: 'Disconnected',
      description: 'Unable to reach server'
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      label: 'Degraded',
      description: 'Service experiencing issues'
    },
    checking: {
      icon: Wifi,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      label: 'Checking...',
      description: 'Verifying connection'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Only show if offline or degraded
  if (status === 'online' && !showDetails) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'fixed top-4 right-4 z-50',
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'backdrop-blur-md border',
          config.bg,
          config.border,
          'shadow-lg',
          'cursor-pointer',
          'transition-all'
        )}
        onClick={() => setShowDetails(!showDetails)}
        role="status"
        aria-live="polite"
        aria-label={`Connection status: ${config.label}`}
      >
        <Icon className={cn('h-4 w-4', config.color)} />
        <div className="flex flex-col">
          <span className={cn('text-xs font-medium', config.color)}>
            {config.label}
          </span>
          {showDetails && (
            <span className="text-xs text-slate-400">
              {config.description}
              {lastCheck && (
                <span className="block mt-1">
                  Last check: {lastCheck.toLocaleTimeString()}
                </span>
              )}
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

