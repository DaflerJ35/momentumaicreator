import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Link2, 
  Settings, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';

interface PlatformConnectionCardProps {
  platform: {
    id: string;
    name: string;
    icon: string | React.ReactNode;
    color: string;
    category: string;
    features: string[];
    enabled: boolean;
  };
  status: ConnectionStatus;
  lastSync?: Date;
  error?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: () => void;
  className?: string;
}

export function PlatformConnectionCard({
  platform,
  status,
  lastSync,
  error,
  onConnect,
  onDisconnect,
  onSync,
  className
}: PlatformConnectionCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      color: 'text-slate-400',
      bg: 'bg-slate-800/30',
      border: 'border-slate-700/50',
      label: 'Not Connected',
      description: 'Click to connect'
    },
    connecting: {
      icon: Loader2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      label: 'Connecting...',
      description: 'Please wait'
    },
    connected: {
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      label: 'Connected',
      description: 'Ready to post'
    },
    syncing: {
      icon: RefreshCw,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      label: 'Syncing...',
      description: 'Updating data'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      label: 'Error',
      description: error || 'Connection failed'
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          'relative group',
          'bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90',
          'backdrop-blur-xl border rounded-2xl',
          'p-6 transition-all duration-300',
          status === 'connected' ? config.border : 'border-slate-700/50',
          status === 'connected' && 'shadow-lg shadow-emerald-500/10',
          'hover:shadow-2xl hover:shadow-emerald-500/20',
          className
        )}
      >
        {/* Status Indicator Bar */}
        <div className={cn(
          'absolute top-0 left-0 right-0 h-1 rounded-t-2xl',
          config.bg,
          status === 'connected' && 'bg-gradient-to-r from-emerald-500 to-cyan-500'
        )} />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Platform Icon */}
            <motion.div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                'bg-gradient-to-br from-slate-800 to-slate-900',
                'border border-slate-700/50',
                'shadow-lg'
              )}
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {typeof platform.icon === 'string' ? (
                <span>{platform.icon}</span>
              ) : (
                platform.icon
              )}
            </motion.div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {platform.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    'text-xs border-slate-700',
                    status === 'connected' && 'border-emerald-500/50 text-emerald-400'
                  )}
                >
                  {platform.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  'border backdrop-blur-sm',
                  config.bg,
                  config.border
                )}
                animate={status === 'syncing' ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <StatusIcon className={cn('h-4 w-4', config.color, status === 'connecting' || status === 'syncing' ? 'animate-spin' : '')} />
                <span className={cn('text-xs font-medium', config.color)}>
                  {config.label}
                </span>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{config.description}</p>
              {lastSync && status === 'connected' && (
                <p className="text-xs text-slate-400 mt-1">
                  Last sync: {lastSync.toLocaleString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Features */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">Available Features:</p>
          <div className="flex flex-wrap gap-1.5">
            {platform.features.slice(0, 3).map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                {feature}
              </Badge>
            ))}
            {platform.features.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50"
              >
                +{platform.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Error Message */}
        {status === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Last Sync Info */}
        {status === 'connected' && lastSync && (
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Synced {formatRelativeTime(lastSync)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {status === 'disconnected' ? (
            <Button
              onClick={onConnect}
              disabled={!platform.enabled}
              className={cn(
                'flex-1 bg-gradient-to-r from-cyan-500 to-purple-600',
                'hover:from-cyan-600 hover:to-purple-700',
                'text-white font-medium',
                'shadow-lg shadow-cyan-500/25',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Link2 className="h-4 w-4 mr-2" />
              {platform.enabled ? 'Connect' : 'Coming Soon'}
            </Button>
          ) : status === 'connected' ? (
            <>
              {onSync && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSync}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sync now</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {/* Open settings */}}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDisconnect}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Disconnect</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : status === 'connecting' ? (
            <Button
              disabled
              className="flex-1 bg-slate-800 text-slate-400 cursor-not-allowed"
            >
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </Button>
          ) : status === 'error' ? (
            <Button
              onClick={onConnect}
              className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          ) : null}
        </div>

        {/* Hover Glow Effect */}
        <AnimatePresence>
          {isHovered && status === 'connected' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

