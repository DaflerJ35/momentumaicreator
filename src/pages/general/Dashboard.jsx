import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';
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
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [idea, setIdea] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const kpis = [
    { 
      title: 'Total Content', 
      value: '2,847', 
      change: '+12.3%', 
      trend: 'up', 
      icon: FileText,
      gradient: 'from-emerald-500 to-cyan-500'
    },
    { 
      title: 'Engagement Rate', 
      value: '8.7%', 
      change: '+2.4%', 
      trend: 'up', 
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Total Reach', 
      value: '1.2M', 
      change: '+18.2%', 
      trend: 'up', 
      icon: Users,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Active Projects', 
      value: '12', 
      change: '+3', 
      trend: 'up', 
      icon: Activity,
      gradient: 'from-amber-500 to-orange-500'
    },
  ];

  const aiTools = [
    {
      icon: Brain,
      title: 'Neural Strategist',
      description: 'AI-powered content strategy',
      link: '/ai-tools/neural-strategist',
      gradient: 'from-emerald-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Performance Predictor',
      description: 'Predict content performance',
      link: '/ai-tools/neural-multiplier',
      gradient: 'from-blue-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: 'Content Transform',
      description: 'Repurpose across platforms',
      link: '/ai-tools/content-transform',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'Creator Hub',
      description: 'All tools in one place',
      link: '/ai-tools/creator-hub',
      gradient: 'from-amber-500 to-red-500',
    },
  ];

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

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome back{currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-slate-400 text-lg">Here's what's happening with your content today</p>
          </div>
          <Link to="/ai-tools">
            <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
              <Sparkles className="mr-2 h-4 w-4" />
              Explore AI Tools
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-6 hover:border-emerald-500/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}>
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
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* AI Idea Analyzer - 2/3 width */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-6 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
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
                className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500/50"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeIdea()}
              />
              <Button 
                onClick={analyzeIdea}
                disabled={loading || !idea.trim()}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
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
                  <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
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

        {/* Quick Stats - 1/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <div className="rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">This Week</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Content Created</span>
                <span className="text-white font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Hours Saved</span>
                <span className="text-emerald-400 font-semibold">16.5h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">AI Credits Used</span>
                <span className="text-white font-semibold">1,247</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm border border-emerald-500/20 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Pro Tip</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Content posted between 6-9 PM on weekdays gets 40% more engagement!
            </p>
          </div>
        </motion.div>
      </div>

      {/* AI Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">AI-Powered Tools</h2>
          <Link to="/ai-tools">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Link to={tool.link}>
                  <div className="h-full rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/50 p-6 transition-all group cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
