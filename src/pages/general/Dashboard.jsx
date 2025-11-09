import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
import { useCollaboration } from '../../contexts/CollaborationContext';
import CollaborationCursor from '../../components/CollaborationCursor';
import { PLATFORMS, getPlatformsByCategory } from '../../lib/platforms';
import { unifiedAPI } from '../../lib/unifiedAPI';
import { StaggerContainer, StaggerItem } from '../../components/animations/StaggerChildren';
import { FloatingElement, PulsingElement } from '../../components/animations/FloatingElements';
import { ShimmerText } from '../../components/animations/ShimmerEffect';
import RevealOnScroll from '../../components/animations/RevealOnScroll';
import AnimatedButton from '../../components/ui/AnimatedButton';
import { RichTooltip } from '../../components/ui/RichTooltip';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Settings,
  Brain,
  Target,
  Zap,
  ArrowRight,
  Users,
  Video,
  Image as ImageIcon,
  TrendingDown,
  Activity,
  Copy,
  RefreshCw,
  Lightbulb,
  Clock,
  Bot,
  Mic,
  Search,
  Archive,
  Star,
  Play,
  LineChart,
  Globe,
  Link2,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'meta+k',
      action: () => {
        // Command palette will be triggered by CommandPalette component
      },
      allowInInputs: true,
    },
    {
      key: 'meta+/',
      action: () => {
        navigate('/ai-tools');
      },
    },
    {
      key: 'meta+p',
      action: () => {
        navigate('/publish');
      },
    },
    {
      key: 'meta+i',
      action: () => {
        navigate('/integrations');
      },
    },
  ]);

  const kpis = [
    { 
      title: 'AI Efficiency', 
      value: '342%', 
      change: '+127%', 
      trend: 'up', 
      icon: Zap,
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]'
    },
    { 
      title: 'Network Reach', 
      value: '1.2M', 
      change: '+89K', 
      trend: 'up', 
      icon: Users,
      gradient: 'from-[hsl(280,85%,60%)] to-[hsl(320,90%,55%)]'
    },
    { 
      title: 'Growth Rate', 
      value: '94.2%', 
      change: '+12.4%', 
      trend: 'up', 
      icon: LineChart,
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(320,90%,55%)]'
    },
    { 
      title: 'Conversion', 
      value: '67.8%', 
      change: '+8.2%', 
      trend: 'up', 
      icon: Target,
      gradient: 'from-[hsl(320,90%,55%)] to-[hsl(280,85%,60%)]'
    },
  ];

  // All 14 AI Tools
  const aiTools = [
    {
      icon: Brain,
      title: 'Neural Strategist',
      description: 'AI-powered content strategy',
      link: '/ai-tools/neural-strategist',
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]',
    },
    {
      icon: Copy,
      title: 'Neural Multiplier',
      description: 'Transform content across platforms',
      link: '/ai-tools/neural-multiplier',
      gradient: 'from-[hsl(280,85%,60%)] to-[hsl(320,90%,55%)]',
    },
    {
      icon: RefreshCw,
      title: 'Content Transform',
      description: 'Repurpose with AI',
      link: '/ai-tools/content-transform',
      gradient: 'from-[hsl(320,90%,55%)] to-[hsl(200,100%,50%)]',
    },
    {
      icon: Bot,
      title: 'Creator Hub',
      description: 'Personalized AI assistant',
      link: '/ai-tools/creator-hub',
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]',
    },
    {
      icon: BarChart3,
      title: 'Trend Analyzer',
      description: 'Discover trending topics',
      link: '/ai-tools/trend-analyzer',
      gradient: 'from-[hsl(280,85%,60%)] to-[hsl(320,90%,55%)]',
    },
    {
      icon: Zap,
      title: 'Hashtag Generator',
      description: 'High-performing hashtags',
      link: '/ai-tools/hashtag-generator',
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(320,90%,55%)]',
    },
    {
      icon: Clock,
      title: 'Content Calendar',
      description: 'Plan your content strategy',
      link: '/ai-tools/content-calendar',
      gradient: 'from-[hsl(320,90%,55%)] to-[hsl(280,85%,60%)]',
    },
    {
      icon: Lightbulb,
      title: 'Idea Generator',
      description: 'Unlimited content ideas',
      link: '/ai-tools/idea-generator',
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]',
    },
    {
      icon: Video,
      title: 'Video Studio',
      description: 'AI video generation',
      link: '/ai-tools/video-studio',
      gradient: 'from-[hsl(280,85%,60%)] to-[hsl(320,90%,55%)]',
    },
    {
      icon: ImageIcon,
      title: 'Image Studio',
      description: 'AI image generation',
      link: '/ai-tools/image-studio',
      gradient: 'from-[hsl(320,90%,55%)] to-[hsl(200,100%,50%)]',
    },
    {
      icon: Mic,
      title: 'Voice Studio',
      description: 'Professional voice overs',
      link: '/ai-tools/voice-studio',
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]',
    },
    {
      icon: Target,
      title: 'Performance Predictor',
      description: 'Predict content performance',
      link: '/ai-tools/performance-predictor',
      gradient: 'from-[hsl(280,85%,60%)] to-[hsl(320,90%,55%)]',
    },
    {
      icon: Search,
      title: 'SEO Optimizer',
      description: 'AI SEO analysis',
      link: '/ai-tools/seo-optimizer',
      gradient: 'from-[hsl(200,100%,50%)] to-[hsl(320,90%,55%)]',
    },
    {
      icon: Archive,
      title: 'Content Library',
      description: 'Smart content organization',
      link: '/ai-tools/smart-content-library',
      gradient: 'from-[hsl(320,90%,55%)] to-[hsl(280,85%,60%)]',
    },
  ];

  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    try {
      const response = await unifiedAPI.get('/platforms/connected');
      if (response.success) {
        setConnectedPlatforms(response.platforms.map(p => p.platformId));
      }
    } catch (error) {
      console.error('Failed to load connected platforms:', error);
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const subscriptionPlatforms = getPlatformsByCategory('subscription');
  const socialPlatforms = getPlatformsByCategory('social');
  const blogPlatforms = getPlatformsByCategory('blog');

  const analyzeIdea = async () => {
    if (!idea.trim()) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysis({
        score: Math.floor(Math.random() * 30) + 70,
        strengths: [
          'High engagement potential with target audience',
          'Strong alignment with current trends',
          'Opportunity for cross-platform content'
        ],
        suggestions: [
          'Consider adding interactive elements',
          'Leverage trending formats for better reach',
          'Best time to post: Weekdays 6-9 PM'
        ]
      });
    } catch (error) {
      console.error('Error analyzing idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const { activeUsers, updateCursor } = useCollaboration();

  // Update cursor position (throttled to avoid overwhelming Firebase)
  useEffect(() => {
    let throttleTimeout;
    const handleMouseMove = (e) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        updateCursor('dashboard', e.clientX, e.clientY);
        throttleTimeout = null;
      }, 100); // Update max once per 100ms
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [updateCursor]);

  return (
    <div className="min-h-screen p-6 md:p-8 relative cosmic-bg">
      <CollaborationCursor pageId="dashboard" />
      
      {/* Galaxy Background Effects - Matching Landing Page */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="galaxy-bg" />
        <div className="stars-layer" />
        <div className="nebula-glow w-96 h-96 bg-neon-violet top-20 left-10" />
        <div className="nebula-glow w-80 h-80 bg-neon-magenta bottom-20 right-10" />
        <div className="nebula-glow w-72 h-72 bg-neon-blue top-40 right-20" />
      </div>

      {/* Header Section - Matching Landing Page Style */}
      <motion.div 
        className="mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-magenta rounded-lg blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-neon-blue to-neon-violet p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                  Creator AI Pro
                </h1>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Growth Platform
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-lg mt-2">Neural Network Intelligence</p>
          </div>
          <Button 
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-[hsl(280,85%,60%)] to-[hsl(320,90%,55%)] hover:from-[hsl(320,90%,55%)] hover:to-[hsl(280,85%,60%)] text-white shadow-[0_0_40px_hsl(280,85%,60%)] hover:shadow-[0_0_60px_hsl(320,90%,55%)] transition-all px-6 py-6 text-lg"
          >
            <Star className="mr-2 h-5 w-5" />
            Upgrade to Pro
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards - Using Landing Page Colors with Premium Animations */}
      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <StaggerItem key={kpi.title}>
              <motion.div
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl glass-morphism border border-white/10 p-6 hover:border-[hsl(200,100%,50%)]/50 transition-all shadow-xl hover:shadow-2xl hover:shadow-[hsl(200,100%,50%)]/20">
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg shadow-neon-blue/30`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {kpi.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">{kpi.title}</p>
                    <p className="text-3xl font-bold text-white">{kpi.value}</p>
                  </div>
                </div>
              </div>
            </motion.div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Welcome Banner - Matching Landing Page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8 relative"
      >
        <div className="relative overflow-hidden rounded-2xl glass-morphism border border-neon-blue/30 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 via-neon-violet/10 to-neon-magenta/10 animate-pulse" />
          
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-neon-blue to-neon-violet shadow-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to AI Growth</h2>
              <h3 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4">
                Unlock Your Potential
              </h3>
              <p className="text-slate-300 text-lg leading-relaxed max-w-3xl">
                Harness the power of artificial intelligence to accelerate your growth and drive meaningful results. 
                Our platform provides intelligent insights and automation to transform your workflow.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connected Platforms Section - NEW */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="h-6 w-6 text-neon-blue" />
            Connected Platforms
          </h2>
          <Button 
            variant="outline" 
            className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Connect Platform
          </Button>
        </div>

        {/* Subscription Platforms */}
        <RevealOnScroll delay={0.3}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neon-violet mb-4">Subscription Platforms</h3>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subscriptionPlatforms.map((platform, index) => (
                <StaggerItem key={platform.id}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.1, 
                      y: -6,
                      rotate: [0, -2, 2, 0],
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/integrations')}
                    className="rounded-xl glass-morphism border border-white/10 hover:border-neon-violet/50 p-4 cursor-pointer transition-all group shadow-lg hover:shadow-xl hover:shadow-neon-violet/20"
                  >
                    <FloatingElement duration={2 + index * 0.1}>
                      <div className="text-3xl mb-2">{platform.icon}</div>
                    </FloatingElement>
                    <div className="text-sm font-semibold text-white group-hover:text-neon-violet transition-colors">
                      {platform.name}
                    </div>
                    <div className="text-xs mt-1">
                      {connectedPlatforms.includes(platform.id) ? (
                        <motion.span 
                          className="text-emerald-400 flex items-center gap-1"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                        >
                          ✓ Connected
                        </motion.span>
                      ) : (
                        <span className="text-slate-400">Not connected</span>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </RevealOnScroll>

        {/* Social Media Platforms */}
        <RevealOnScroll delay={0.4}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neon-blue mb-4">Social Media</h3>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {socialPlatforms.slice(0, 12).map((platform, index) => (
                <StaggerItem key={platform.id}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.1, 
                      y: -6,
                      rotate: [0, -2, 2, 0],
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/integrations')}
                    className="rounded-xl glass-morphism border border-white/10 hover:border-neon-blue/50 p-4 cursor-pointer transition-all group shadow-lg hover:shadow-xl hover:shadow-neon-blue/20"
                  >
                    <FloatingElement duration={2 + index * 0.1}>
                      <div className="text-3xl mb-2">{platform.icon}</div>
                    </FloatingElement>
                    <div className="text-sm font-semibold text-white group-hover:text-neon-blue transition-colors">
                      {platform.name}
                    </div>
                    <div className="text-xs mt-1">
                      {connectedPlatforms.includes(platform.id) ? (
                        <motion.span 
                          className="text-emerald-400 flex items-center gap-1"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                        >
                          ✓ Connected
                        </motion.span>
                      ) : (
                        <span className="text-slate-400">Not connected</span>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </RevealOnScroll>

        {/* Blog Platforms */}
        <RevealOnScroll delay={0.5}>
          <div>
            <h3 className="text-lg font-semibold text-neon-magenta mb-4">Blog Platforms</h3>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {blogPlatforms.map((platform, index) => (
                <StaggerItem key={platform.id}>
                  <motion.div
                    whileHover={{ 
                      scale: 1.1, 
                      y: -6,
                      rotate: [0, -2, 2, 0],
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/integrations')}
                    className="rounded-xl glass-morphism border border-white/10 hover:border-neon-magenta/50 p-4 cursor-pointer transition-all group shadow-lg hover:shadow-xl hover:shadow-neon-magenta/20"
                  >
                    <FloatingElement duration={2 + index * 0.1}>
                      <div className="text-3xl mb-2">{platform.icon}</div>
                    </FloatingElement>
                    <div className="text-sm font-semibold text-white group-hover:text-neon-magenta transition-colors">
                      {platform.name}
                    </div>
                    <div className="text-xs mt-1">
                      {connectedPlatforms.includes(platform.id) ? (
                        <motion.span 
                          className="text-emerald-400 flex items-center gap-1"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                        >
                          ✓ Connected
                        </motion.span>
                      ) : (
                        <span className="text-slate-400">Not connected</span>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </RevealOnScroll>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Zap className="h-6 w-6 text-neon-blue" />
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, title: 'Quick Start', desc: 'Get up and running in minutes.', gradient: 'from-neon-blue to-neon-violet' },
            { icon: BarChart3, title: 'Analyze Data', desc: 'Deep dive into your metrics.', gradient: 'from-neon-violet to-neon-magenta' },
            { icon: FileText, title: 'Generate Report', desc: 'Create comprehensive reports.', gradient: 'from-neon-magenta to-neon-blue' },
            { icon: Settings, title: 'Configure AI', desc: 'Customize your AI models.', gradient: 'from-neon-blue to-neon-magenta' },
          ].map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="rounded-xl glass-morphism border border-white/10 hover:border-neon-blue/50 p-6 transition-all cursor-pointer group">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {action.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* AI Idea Analyzer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mb-8"
      >
        <div className="rounded-2xl glass-morphism border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-neon-blue to-neon-violet">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Idea Analyzer</h2>
              <p className="text-sm text-slate-400">Get instant feedback on your content ideas</p>
            </div>
          </div>
          
          <div className="flex gap-3 mb-6">
            <Input
              type="text"
              placeholder="Enter your content idea..."
              className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-neon-blue/50"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyzeIdea()}
            />
            <Button 
              onClick={analyzeIdea}
              disabled={loading || !idea.trim()}
              className="bg-gradient-to-r from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)] hover:from-[hsl(280,85%,60%)] hover:to-[hsl(320,90%,55%)]"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
                <div className="text-5xl font-bold gradient-text">
                  {analysis.score}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">Potential Score</div>
                  <div className="text-sm text-slate-400">Strong content opportunity</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span className="text-amber-400">💡</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* AI Tools Grid - All 14 Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="h-6 w-6 text-neon-blue" />
            AI-Powered Tools
          </h2>
          <Link to="/ai-tools">
            <Button variant="ghost" className="text-slate-400 hover:text-white border border-white/10 hover:border-neon-blue/50">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aiTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(tool.link)}
                className="cursor-pointer"
              >
                <div className="h-full rounded-xl glass-morphism border border-white/10 hover:border-neon-blue/50 p-5 transition-all group relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Performance Metrics & Recent Activity Placeholders */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="rounded-2xl glass-morphism border border-white/10 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-neon-blue" />
            Performance Metrics
          </h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>Chart visualization coming soon</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="rounded-2xl glass-morphism border border-white/10 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-neon-blue" />
            Recent Activity
          </h3>
          <div className="h-64 flex items-center justify-center text-slate-400">
            <p>Activity feed coming soon</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
