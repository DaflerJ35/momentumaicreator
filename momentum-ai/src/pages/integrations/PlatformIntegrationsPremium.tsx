import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3x3, 
  List, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  Zap
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PlatformConnectionCard, ConnectionStatus } from '../../components/platforms/PlatformConnectionCard';
import { PLATFORMS, getPlatformsByCategory, CATEGORIES } from '../../lib/platforms';
import { platformAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { setRedirectPath } from '../../components/auth/AuthModal';
import { cn } from '../../lib/utils';

type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'subscription' | 'social' | 'blog';

export default function PlatformIntegrationsPremium() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, any>>({});
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatus>>({});
  const [syncingPlatforms, setSyncingPlatforms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [connecting, setConnecting] = useState<string | null>(null);
  
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialize connection statuses
  useEffect(() => {
    const statuses: Record<string, ConnectionStatus> = {};
    Object.keys(PLATFORMS).forEach(platformId => {
      statuses[platformId] = 'disconnected';
    });
    setConnectionStatuses(statuses);
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const errorCode = searchParams.get('error_code');
    const connected = searchParams.get('connected');
    const cid = searchParams.get('cid');

    if (errorCode) {
      const errorMessages: Record<string, string> = {
        'PROVIDER_DENIED': 'You denied access. Please try again.',
        'INVALID_REQUEST': 'Invalid request. Please try again.',
        'INVALID_STATE': 'Session expired. Please try connecting again.',
        'TOKEN_EXCHANGE_FAILED': 'Failed to complete connection. Please try again.',
      };
      toast.error(errorMessages[errorCode] || 'Connection failed', {
        description: cid ? `Error ID: ${cid}` : undefined
      });
      navigate('/integrations', { replace: true });
    }

    if (connected) {
      toast.success(`Successfully connected to ${PLATFORMS[connected]?.name || connected}!`);
      loadConnectedPlatforms();
      navigate('/integrations', { replace: true });
    }
  }, [searchParams, navigate]);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated && !currentUser) {
      setRedirectPath('/integrations');
      navigate('/auth/signin?showAuth=1');
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Load connected platforms
  const loadConnectedPlatforms = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await platformAPI.getConnectedPlatforms();
      
      if (response.success) {
        const connected: Record<string, any> = {};
        const statuses: Record<string, ConnectionStatus> = { ...connectionStatuses };
        
        response.platforms.forEach((platform: any) => {
          connected[platform.platformId] = platform;
          statuses[platform.platformId] = 'connected';
        });
        
        setConnectedPlatforms(connected);
        setConnectionStatuses(statuses);
      }
    } catch (error: any) {
      console.error('Failed to load connected platforms:', error);
      if (error.message?.includes('Authentication')) {
        setRedirectPath('/integrations');
        navigate('/auth/signin?showAuth=1');
      } else {
        toast.error('Failed to load connections');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConnectedPlatforms();
    }
  }, [isAuthenticated, loadConnectedPlatforms]);

  // Handle connect
  const handleConnect = async (platformId: string) => {
    if (!isAuthenticated) {
      setRedirectPath('/integrations');
      navigate('/auth/signin?showAuth=1');
      return;
    }

    const platform = PLATFORMS[platformId];
    if (!platform?.enabled) {
      toast.info(`${platform?.name || platformId} is coming soon!`);
      return;
    }

    setConnecting(platformId);
    setConnectionStatuses(prev => ({ ...prev, [platformId]: 'connecting' }));

    try {
      const response = await platformAPI.initOAuth(platformId);
      if (response.success && response.oauthUrl) {
        window.location.href = response.oauthUrl;
      } else {
        throw new Error('Failed to initialize OAuth');
      }
    } catch (error: any) {
      console.error('OAuth init error:', error);
      setConnectionStatuses(prev => ({ ...prev, [platformId]: 'error' }));
      toast.error(`Failed to connect: ${error.message}`);
      setConnecting(null);
    }
  };

  // Handle disconnect
  const handleDisconnect = async (platformId: string) => {
    if (!isAuthenticated) return;

    try {
      await platformAPI.disconnectPlatform(platformId);
      setConnectedPlatforms(prev => {
        const next = { ...prev };
        delete next[platformId];
        return next;
      });
      setConnectionStatuses(prev => ({ ...prev, [platformId]: 'disconnected' }));
      toast.success(`Disconnected from ${PLATFORMS[platformId]?.name}`);
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error(`Failed to disconnect: ${error.message}`);
    }
  };

  // Handle sync
  const handleSync = async (platformId: string) => {
    setSyncingPlatforms(prev => new Set(prev).add(platformId));
    setConnectionStatuses(prev => ({ ...prev, [platformId]: 'syncing' }));

    try {
      // TODO: Implement sync API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate
      toast.success(`Synced ${PLATFORMS[platformId]?.name}`);
      setConnectionStatuses(prev => ({ ...prev, [platformId]: 'connected' }));
    } catch (error: any) {
      toast.error(`Sync failed: ${error.message}`);
      setConnectionStatuses(prev => ({ ...prev, [platformId]: 'error' }));
    } finally {
      setSyncingPlatforms(prev => {
        const next = new Set(prev);
        next.delete(platformId);
        return next;
      });
    }
  };

  // Filter platforms
  const filteredPlatforms = Object.values(PLATFORMS).filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         platform.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || platform.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const subscriptionPlatforms = getPlatformsByCategory('subscription');
  const socialPlatforms = getPlatformsByCategory('social');
  const blogPlatforms = getPlatformsByCategory('blog');

  const connectedCount = Object.keys(connectedPlatforms).length;
  const totalCount = Object.keys(PLATFORMS).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-8 w-8 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Platform Integrations
              </h1>
              <p className="text-slate-400 text-lg">
                Connect your social media, subscription, and blog platforms
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {connectedCount} / {totalCount} Connected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadConnectedPlatforms}
                className="border-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search platforms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  viewMode === 'grid' && 'bg-cyan-500 hover:bg-cyan-600',
                  'border-slate-700'
                )}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  viewMode === 'list' && 'bg-cyan-500 hover:bg-cyan-600',
                  'border-slate-700'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Platform Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 border border-slate-700">
            <TabsTrigger value="all" onClick={() => setFilterCategory('all')}>
              All Platforms
            </TabsTrigger>
            <TabsTrigger value="subscription" onClick={() => setFilterCategory('subscription')}>
              Subscription
            </TabsTrigger>
            <TabsTrigger value="social" onClick={() => setFilterCategory('social')}>
              Social Media
            </TabsTrigger>
            <TabsTrigger value="blog" onClick={() => setFilterCategory('blog')}>
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <PlatformGrid
              platforms={filteredPlatforms}
              connectionStatuses={connectionStatuses}
              connectedPlatforms={connectedPlatforms}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <PlatformGrid
              platforms={subscriptionPlatforms.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              connectionStatuses={connectionStatuses}
              connectedPlatforms={connectedPlatforms}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="social" className="mt-6">
            <PlatformGrid
              platforms={socialPlatforms.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              connectionStatuses={connectionStatuses}
              connectedPlatforms={connectedPlatforms}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <PlatformGrid
              platforms={blogPlatforms.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              connectionStatuses={connectionStatuses}
              connectedPlatforms={connectedPlatforms}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
              viewMode={viewMode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PlatformGrid({
  platforms,
  connectionStatuses,
  connectedPlatforms,
  onConnect,
  onDisconnect,
  onSync,
  viewMode
}: {
  platforms: any[];
  connectionStatuses: Record<string, ConnectionStatus>;
  connectedPlatforms: Record<string, any>;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSync?: (id: string) => void;
  viewMode: 'grid' | 'list';
}) {
  if (platforms.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400">No platforms found</p>
      </div>
    );
  }

  return (
    <div className={cn(
      viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        : 'flex flex-col gap-4'
    )}>
      {platforms.map((platform) => {
        const status = connectionStatuses[platform.id] || 'disconnected';
        const connected = connectedPlatforms[platform.id];
        
        return (
          <PlatformConnectionCard
            key={platform.id}
            platform={platform}
            status={status}
            lastSync={connected?.lastSync ? new Date(connected.lastSync) : undefined}
            onConnect={() => onConnect(platform.id)}
            onDisconnect={() => onDisconnect(platform.id)}
            onSync={onSync ? () => onSync(platform.id) : undefined}
          />
        );
      })}
    </div>
  );
}

