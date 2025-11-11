import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { PLATFORMS, getPlatformsByCategory } from '../../lib/platforms';
import { unifiedAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Share2, 
  MousePointerClick,
  Calendar,
  Loader2,
  Globe
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PlatformAnalytics = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allPlatformsAnalytics, setAllPlatformsAnalytics] = useState({});

  const subscriptionPlatforms = getPlatformsByCategory('subscription');
  const socialPlatforms = getPlatformsByCategory('social');
  const blogPlatforms = getPlatformsByCategory('blog');
  const allPlatforms = [...subscriptionPlatforms, ...socialPlatforms, ...blogPlatforms];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPlatform, dateRange]);

  const loadAnalytics = async () => {
    if (!selectedPlatform) {
      // Load all platforms
      setLoading(true);
      try {
        const platforms = await unifiedAPI.get('/platforms/connected');
        if (platforms.success && platforms.platforms) {
          const analyticsPromises = platforms.platforms.map(async (platform) => {
            try {
              const dates = getDateRange(dateRange);
              const data = await unifiedAPI.get(
                `/platforms/${platform.platformId}/analytics?startDate=${dates.start}&endDate=${dates.end}`
              );
              return {
                platformId: platform.platformId,
                analytics: data.analytics,
              };
            } catch (error) {
              return {
                platformId: platform.platformId,
                analytics: null,
                error: error.message,
              };
            }
          });
          
          const results = await Promise.all(analyticsPromises);
          const analyticsMap = {};
          results.forEach(result => {
            analyticsMap[result.platformId] = result.analytics;
          });
          setAllPlatformsAnalytics(analyticsMap);
        }
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const dates = getDateRange(dateRange);
      const data = await unifiedAPI.get(
        `/platforms/${selectedPlatform}/analytics?startDate=${dates.start}&endDate=${dates.end}`
      );
      setAnalytics(data.analytics);
    } catch (error) {
      toast.error('Failed to load analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    const end = now.toISOString();
    let start;
    
    switch (range) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    return { start, end };
  };

  const getTotalAnalytics = () => {
    const totals = {
      impressions: 0,
      engagements: 0,
      reach: 0,
      clicks: 0,
      posts: 0,
    };
    
    Object.values(allPlatformsAnalytics).forEach(analytics => {
      if (analytics) {
        totals.impressions += analytics.impressions || 0;
        totals.engagements += analytics.engagements || 0;
        totals.reach += analytics.reach || 0;
        totals.clicks += analytics.clicks || 0;
        totals.posts += analytics.posts || 0;
      }
    });
    
    return totals;
  };

  const totalAnalytics = getTotalAnalytics();

  // Generate chart data
  const chartData = selectedPlatform && analytics ? [
    { name: 'Impressions', value: analytics.impressions || 0 },
    { name: 'Engagements', value: analytics.engagements || 0 },
    { name: 'Reach', value: analytics.reach || 0 },
    { name: 'Clicks', value: analytics.clicks || 0 },
  ] : [];

  const allPlatformsChartData = Object.entries(allPlatformsAnalytics).map(([platformId, analytics]) => ({
    name: PLATFORMS[platformId]?.name || platformId,
    impressions: analytics?.impressions || 0,
    engagements: analytics?.engagements || 0,
    reach: analytics?.reach || 0,
  }));

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
          <h1 className="text-4xl font-bold gradient-text mb-2">Platform Analytics</h1>
          <p className="text-slate-400 text-lg">
            Track performance across all your connected platforms
          </p>
        </motion.div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="glass-morphism border border-white/10">
            <CardContent className="p-4">
              <Label className="text-slate-300 mb-2 block">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Platforms</SelectItem>
                  {allPlatforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.icon} {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-white/10">
            <CardContent className="p-4">
              <Label className="text-slate-300 mb-2 block">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            {selectedPlatform ? (
              analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="glass-morphism border border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Eye className="h-8 w-8 text-neon-blue" />
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Impressions</p>
                        <p className="text-3xl font-bold text-white">{analytics.impressions?.toLocaleString() || 0}</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="glass-morphism border border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Heart className="h-8 w-8 text-neon-magenta" />
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Engagements</p>
                        <p className="text-3xl font-bold text-white">{analytics.engagements?.toLocaleString() || 0}</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="glass-morphism border border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Globe className="h-8 w-8 text-neon-violet" />
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Reach</p>
                        <p className="text-3xl font-bold text-white">{analytics.reach?.toLocaleString() || 0}</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="glass-morphism border border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <MousePointerClick className="h-8 w-8 text-amber-400" />
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-sm text-slate-400 mb-2">Clicks</p>
                        <p className="text-3xl font-bold text-white">{analytics.clicks?.toLocaleString() || 0}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-morphism border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Eye className="h-8 w-8 text-neon-blue" />
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Total Impressions</p>
                      <p className="text-3xl font-bold text-white">{totalAnalytics.impressions.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="glass-morphism border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Heart className="h-8 w-8 text-neon-magenta" />
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Total Engagements</p>
                      <p className="text-3xl font-bold text-white">{totalAnalytics.engagements.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass-morphism border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Globe className="h-8 w-8 text-neon-violet" />
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Total Reach</p>
                      <p className="text-3xl font-bold text-white">{totalAnalytics.reach.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="glass-morphism border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <BarChart3 className="h-8 w-8 text-amber-400" />
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400 mb-2">Total Posts</p>
                      <p className="text-3xl font-bold text-white">{totalAnalytics.posts}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {selectedPlatform && analytics && chartData.length > 0 && (
                <Card className="glass-morphism border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {!selectedPlatform && allPlatformsChartData.length > 0 && (
                <Card className="glass-morphism border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Platform Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={allPlatformsChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
                        <Bar dataKey="engagements" fill="#ec4899" name="Engagements" />
                        <Bar dataKey="reach" fill="#8b5cf6" name="Reach" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;

