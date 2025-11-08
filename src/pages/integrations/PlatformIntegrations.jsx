import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { PLATFORMS, getPlatformsByCategory, CATEGORIES } from '../../lib/platforms';
import { Link2, Check, X, Settings, Globe } from 'lucide-react';
import { toast } from 'sonner';

const PlatformIntegrations = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [connecting, setConnecting] = useState(null);

  const subscriptionPlatforms = getPlatformsByCategory('subscription');
  const socialPlatforms = getPlatformsByCategory('social');
  const blogPlatforms = getPlatformsByCategory('blog');

  const handleConnect = async (platformId) => {
    setConnecting(platformId);
    
    // Simulate API connection
    setTimeout(() => {
      setConnectedPlatforms([...connectedPlatforms, platformId]);
      setConnecting(null);
      toast.success(`${PLATFORMS[platformId].name} connected successfully!`);
    }, 2000);
  };

  const handleDisconnect = (platformId) => {
    setConnectedPlatforms(connectedPlatforms.filter(id => id !== platformId));
    toast.success(`${PLATFORMS[platformId].name} disconnected`);
  };

  const isConnected = (platformId) => connectedPlatforms.includes(platformId);

  const PlatformCard = ({ platform }) => {
    const connected = isConnected(platform.id);
    const connectingNow = connecting === platform.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -4, scale: 1.02 }}
        className="relative"
      >
        <Card className="glass-morphism border border-white/10 hover:border-neon-blue/50 transition-all h-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{platform.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-white">{platform.name}</h3>
                  <p className="text-xs text-slate-400">{platform.category}</p>
                </div>
              </div>
              {connected && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="h-5 w-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-slate-300 mb-2">Features:</p>
              <div className="flex flex-wrap gap-2">
                {platform.features.map((feature) => (
                  <span
                    key={feature}
                    className="text-xs px-2 py-1 bg-slate-800/50 rounded-md text-slate-400"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {connected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                    onClick={() => handleDisconnect(platform.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDisconnect(platform.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)] hover:from-[hsl(280,85%,60%)] hover:to-[hsl(320,90%,55%)]"
                  onClick={() => handleConnect(platform.id)}
                  disabled={connectingNow}
                >
                  {connectingNow ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8 relative cosmic-bg">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="galaxy-bg" />
        <div className="stars-layer" />
        <div className="nebula-glow w-96 h-96 bg-neon-violet top-20 left-10" />
        <div className="nebula-glow w-80 h-80 bg-neon-magenta bottom-20 right-10" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Platform Integrations</h1>
          <p className="text-slate-400 text-lg">
            Connect your social media, subscription, and blog platforms to automate your content distribution
          </p>
        </motion.div>

        {/* Subscription Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-neon-violet" />
            <h2 className="text-2xl font-bold text-white">Subscription Platforms</h2>
            <span className="text-sm text-slate-400">({subscriptionPlatforms.length} platforms)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlatforms.map((platform) => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </motion.div>

        {/* Social Media Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-neon-blue" />
            <h2 className="text-2xl font-bold text-white">Social Media Platforms</h2>
            <span className="text-sm text-slate-400">({socialPlatforms.length} platforms)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {socialPlatforms.map((platform) => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </motion.div>

        {/* Blog Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-neon-magenta" />
            <h2 className="text-2xl font-bold text-white">Blog Platforms</h2>
            <span className="text-sm text-slate-400">({blogPlatforms.length} platforms)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPlatforms.map((platform) => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlatformIntegrations;

