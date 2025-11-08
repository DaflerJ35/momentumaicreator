import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  DollarSign,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Activity,
  Target,
} from 'lucide-react';
import { unifiedAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';
import { StaggerContainer, StaggerItem } from '../../components/animations/StaggerChildren';
import { FloatingElement } from '../../components/animations/FloatingElements';
import RevealOnScroll from '../../components/animations/RevealOnScroll';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  const mockData = {
    overview: {
      totalReach: 1250000,
      engagement: 89234,
      impressions: 3450000,
      revenue: 45230,
      growth: 23.5,
    },
    engagement: [
      { date: '2024-01-01', likes: 1200, comments: 340, shares: 89, saves: 234 },
      { date: '2024-01-08', likes: 1450, comments: 420, shares: 102, saves: 289 },
      { date: '2024-01-15', likes: 1680, comments: 510, shares: 125, saves: 345 },
      { date: '2024-01-22', likes: 1920, comments: 590, shares: 148, saves: 401 },
      { date: '2024-01-29', likes: 2150, comments: 670, shares: 171, saves: 456 },
    ],
    platformBreakdown: [
      { name: 'Instagram', value: 45, posts: 234, engagement: 89234 },
      { name: 'Twitter', value: 25, posts: 156, engagement: 45678 },
      { name: 'TikTok', value: 20, posts: 189, engagement: 123456 },
      { name: 'YouTube', value: 10, posts: 45, engagement: 23456 },
    ],
    contentPerformance: [
      { name: 'Video', views: 45000, engagement: 8923, revenue: 12000 },
      { name: 'Image', views: 32000, engagement: 6543, revenue: 8900 },
      { name: 'Carousel', views: 28000, engagement: 5432, revenue: 7200 },
      { name: 'Story', views: 15000, engagement: 2345, revenue: 3400 },
    ],
    audienceGrowth: [
      { month: 'Jan', followers: 45000, growth: 5.2 },
      { month: 'Feb', followers: 47200, growth: 4.9 },
      { month: 'Mar', followers: 49500, growth: 4.9 },
      { month: 'Apr', followers: 51900, growth: 4.8 },
      { month: 'May', followers: 54400, growth: 4.8 },
      { month: 'Jun', followers: 57100, growth: 5.0 },
    ],
    bestTimes: [
      { hour: '8 AM', engagement: 234, posts: 12 },
      { hour: '12 PM', engagement: 456, posts: 23 },
      { hour: '6 PM', engagement: 678, posts: 34 },
      { hour: '9 PM', engagement: 789, posts: 45 },
    ],
    radarData: [
      { subject: 'Reach', A: 120, fullMark: 150 },
      { subject: 'Engagement', A: 98, fullMark: 150 },
      { subject: 'Growth', A: 86, fullMark: 150 },
      { subject: 'Revenue', A: 99, fullMark: 150 },
      { subject: 'Retention', A: 112, fullMark: 150 },
      { subject: 'Conversion', A: 85, fullMark: 150 },
    ],
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedPlatform]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const response = await unifiedAPI.get(`/analytics?range=${timeRange}&platform=${selectedPlatform}`);
      // setAnalyticsData(response.data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics data');
      setAnalyticsData(mockData); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    toast.success('Exporting analytics data...');
    // TODO: Implement CSV/PDF export
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[hsl(200,100%,50%)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 relative cosmic-bg">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="galaxy-bg" />
        <div className="stars-layer" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <RevealOnScroll delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Advanced Analytics</h1>
              <p className="text-slate-400 text-lg">Deep insights into your content performance</p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={exportData}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </RevealOnScroll>

        {/* Overview KPIs */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData?.overview && Object.entries(analyticsData.overview).map(([key, value], index) => {
            if (key === 'growth') return null;
            const icons = {
              totalReach: Users,
              engagement: Heart,
              impressions: Eye,
              revenue: DollarSign,
            };
            const Icon = icons[key] || Activity;
            const labels = {
              totalReach: 'Total Reach',
              engagement: 'Engagement',
              impressions: 'Impressions',
              revenue: 'Revenue',
            };
            
            return (
              <StaggerItem key={key}>
                <Card className="glass-morphism border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FloatingElement>
                        <div className="p-3 rounded-lg bg-gradient-to-br from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </FloatingElement>
                      <div className={`flex items-center gap-1 text-sm font-medium text-[hsl(200,100%,50%)]`}>
                        <TrendingUp className="h-4 w-4" />
                        {analyticsData.overview.growth}%
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{labels[key]}</p>
                    <p className="text-3xl font-bold text-white">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Engagement Chart */}
        <RevealOnScroll delay={0.2}>
          <Card className="glass-morphism border border-white/10 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                Engagement Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData?.engagement}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="likes" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEngagement)" />
                  <Area type="monotone" dataKey="comments" stackId="1" stroke="#8b5cf6" fillOpacity={1} fill="#8b5cf6" />
                  <Area type="monotone" dataKey="shares" stackId="1" stroke="#ec4899" fillOpacity={1} fill="#ec4899" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </RevealOnScroll>

        {/* Platform Breakdown & Content Performance */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <RevealOnScroll delay={0.3}>
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                  Platform Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.platformBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.platformBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </RevealOnScroll>

          <RevealOnScroll delay={0.4}>
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                  Content Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.contentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" />
                    <Bar dataKey="engagement" fill="#8b5cf6" />
                    <Bar dataKey="revenue" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </RevealOnScroll>
        </div>

        {/* Audience Growth & Best Times */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <RevealOnScroll delay={0.5}>
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                  Audience Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.audienceGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="followers" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="growth" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </RevealOnScroll>

          <RevealOnScroll delay={0.6}>
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                  Best Posting Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.bestTimes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="hour" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="engagement" fill="#3b82f6" />
                    <Bar dataKey="posts" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </RevealOnScroll>
        </div>

        {/* Performance Radar */}
        <RevealOnScroll delay={0.7}>
          <Card className="glass-morphism border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                Performance Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={analyticsData?.radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;

