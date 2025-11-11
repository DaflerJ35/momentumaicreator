/**
 * Fast-Track Monetization Flow
 * Gets users making money ASAP - 5-minute setup to first dollar
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Share2,
  Sparkles,
  Target,
  Rocket,
  CreditCard,
  BarChart3,
  Clock,
  Play,
  Link2,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
  Crown,
  Gift,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge.jsx';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { database, ref, get, set, update } from '../../lib/firebase';
import { unifiedAPI } from '../../lib/unifiedAPI';
import { getPlatformsByCategory } from '../../lib/platforms';

const MONETIZATION_STEPS = [
  {
    id: 'setup',
    title: 'Quick Setup',
    description: 'Connect your money-making platforms',
    icon: Share2,
    time: '2 min',
    content: 'setup'
  },
  {
    id: 'create',
    title: 'Create Content',
    description: 'Generate your first monetizable content',
    icon: Sparkles,
    time: '1 min',
    content: 'create'
  },
  {
    id: 'publish',
    title: 'Publish & Earn',
    description: 'Publish to all platforms and start earning',
    icon: DollarSign,
    time: '30 sec',
    content: 'publish'
  },
  {
    id: 'optimize',
    title: 'Optimize Revenue',
    description: 'Track performance and maximize earnings',
    icon: TrendingUp,
    time: '1 min',
    content: 'optimize'
  }
];

const FastTrackMonetization = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [contentCreated, setContentCreated] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Get all monetization platforms
  const allPlatforms = [
    ...getPlatformsByCategory('subscription'),
    ...getPlatformsByCategory('social').slice(0, 6), // Top social platforms
  ];

  // Check user's existing connections and progress
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!currentUser || !database) return;

      try {
        const userRef = ref(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Load connected platforms
          if (userData.connectedPlatforms) {
            setConnectedPlatforms(userData.connectedPlatforms);
            setSelectedPlatforms(userData.connectedPlatforms);
          }
          
          // Load earnings data
          if (userData.earnings) {
            setEarnings(userData.earnings);
          }
          
          // Check if content was created
          if (userData.lastContentCreated) {
            setContentCreated(true);
            setContentData(userData.lastContentCreated);
          }
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    };

    loadUserProgress();
  }, [currentUser]);

  const handleNext = () => {
    if (currentStep < MONETIZATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedSteps([...completedSteps, currentStep]);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      if (currentUser && database) {
        const userRef = ref(database, `users/${currentUser.uid}/monetization`);
        await set(userRef, {
          fastTrackCompleted: true,
          completedAt: Date.now(),
          platforms: selectedPlatforms,
          firstEarnings: earnings,
        });
      }

      toast.success('🎉 Fast-track setup complete! Start making money!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing fast-track:', error);
      toast.error('Failed to save progress');
    }
  };

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(id => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleConnectPlatform = async (platformId) => {
    try {
      setLoading(true);
      // Navigate to platform integration page
      navigate(`/integrations?platform=${platformId}&return=/monetization/fast-track`);
      toast.info(`Connecting ${allPlatforms.find(p => p.id === platformId)?.name}...`);
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast.error('Failed to connect platform');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      setLoading(true);
      // Navigate to Neural Multiplier for quick content creation
      navigate('/ai-tools/neural-multiplier?fastTrack=true');
      toast.success('Creating your first monetizable content...');
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      // Navigate to content publisher
      navigate('/content/publisher?fastTrack=true');
      toast.success('Publishing your content...');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish content');
    } finally {
      setPublishing(false);
    }
  };

  const renderStepContent = () => {
    const step = MONETIZATION_STEPS[currentStep];
    
    switch (step.content) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Connect Your Money-Making Platforms
              </h3>
              <p className="text-slate-400">
                Select the platforms where you want to earn money. We'll help you connect them.
              </p>
            </div>

            {/* Platform Categories */}
            <div className="space-y-6">
              {/* Subscription Platforms */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Subscription Platforms (Highest Earnings)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getPlatformsByCategory('subscription').map((platform) => (
                    <motion.button
                      key={platform.id}
                      onClick={() => {
                        if (connectedPlatforms.includes(platform.id)) {
                          return; // Already connected
                        }
                        togglePlatform(platform.id);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : connectedPlatforms.includes(platform.id)
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{platform.icon}</span>
                        {connectedPlatforms.includes(platform.id) && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                        {selectedPlatforms.includes(platform.id) && !connectedPlatforms.includes(platform.id) && (
                          <Badge className="bg-emerald-500">Selected</Badge>
                        )}
                      </div>
                      <p className="font-semibold text-white text-sm">{platform.name}</p>
                      <p className="text-xs text-slate-400 mt-1">High revenue potential</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Social Media Platforms */}
              <div>
                <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Social Media Platforms (Reach & Engagement)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getPlatformsByCategory('social').slice(0, 8).map((platform) => (
                    <motion.button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : connectedPlatforms.includes(platform.id)
                          ? 'border-green-500/50 bg-green-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{platform.icon}</span>
                        {connectedPlatforms.includes(platform.id) && (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                      <p className="font-semibold text-white text-sm">{platform.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {selectedPlatforms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-400 font-semibold">
                      ✅ {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedPlatforms.filter(id => !connectedPlatforms.includes(id)).length > 0
                        ? `${selectedPlatforms.filter(id => !connectedPlatforms.includes(id)).length} need connection`
                        : 'All platforms connected!'}
                    </p>
                  </div>
                  {selectedPlatforms.filter(id => !connectedPlatforms.includes(id)).length > 0 && (
                    <Button
                      onClick={() => {
                        const unconnected = selectedPlatforms.find(id => !connectedPlatforms.includes(id));
                        if (unconnected) handleConnectPlatform(unconnected);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Connect Now
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quick Tips */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Pro Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  💰 <strong>Subscription platforms</strong> (OnlyFans, Fansly, etc.) typically generate the highest revenue per post.
                  <br />
                  📱 <strong>Social platforms</strong> help build your audience and drive traffic to your subscription content.
                  <br />
                  🚀 <strong>Connect at least 2-3 platforms</strong> to maximize your earning potential!
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'create':
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Create Your First Monetizable Content
            </h3>
            <p className="text-slate-300 mb-6">
              Use AI to generate content optimized for maximum earnings
            </p>

            {contentCreated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-6"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-emerald-400 font-semibold mb-2">Content Created! ✅</p>
                <p className="text-sm text-slate-400">
                  Your content is ready to publish and start earning
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Neural Multiplier</CardTitle>
                    <CardDescription className="text-slate-400">
                      Transform one piece of content into multiple formats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left text-sm text-slate-300 space-y-2 mb-4">
                      <li>✅ Create content for all platforms at once</li>
                      <li>✅ Optimized for each platform's format</li>
                      <li>✅ AI-powered content transformation</li>
                      <li>✅ Save hours of manual work</li>
                    </ul>
                    <Button
                      onClick={handleCreateContent}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Content
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Content Ideas</CardTitle>
                    <CardDescription className="text-slate-400">
                      Get AI-generated content ideas for your niche
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-left text-sm text-slate-300 space-y-2 mb-4">
                      <li>✅ Unlimited content ideas</li>
                      <li>✅ Tailored to your niche</li>
                      <li>✅ High-converting formats</li>
                      <li>✅ Trending topics included</li>
                    </ul>
                    <Button
                      onClick={() => navigate('/ai-tools/idea-generator')}
                      variant="outline"
                      className="w-full border-slate-600"
                    >
                      Get Ideas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Revenue Tips */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/50">
              <CardContent className="pt-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Content That Converts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-emerald-400 font-semibold mb-1">💰 Value First</p>
                    <p className="text-slate-300">Provide value before asking for payment</p>
                  </div>
                  <div>
                    <p className="text-emerald-400 font-semibold mb-1">📸 Visual Appeal</p>
                    <p className="text-slate-300">High-quality visuals increase engagement</p>
                  </div>
                  <div>
                    <p className="text-emerald-400 font-semibold mb-1">⏰ Consistency</p>
                    <p className="text-slate-300">Post regularly to build trust and revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'publish':
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Publish & Start Making Money
            </h3>
            <p className="text-slate-300 mb-6">
              Publish your content to all connected platforms with one click
            </p>

            {/* Publishing Status */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Platforms Connected</span>
                <span className="text-emerald-400 font-semibold">
                  {connectedPlatforms.length} / {selectedPlatforms.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Content Ready</span>
                {contentCreated ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ready to Publish</span>
                {contentCreated && connectedPlatforms.length > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                )}
              </div>
            </div>

            {contentCreated && connectedPlatforms.length > 0 ? (
              <Button
                onClick={handlePublish}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                size="lg"
                disabled={publishing}
              >
                {publishing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish to All Platforms & Start Earning 💰
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                {!contentCreated && (
                  <Button
                    onClick={handleCreateContent}
                    variant="outline"
                    className="w-full border-slate-600"
                  >
                    Create Content First
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {connectedPlatforms.length === 0 && (
                  <Button
                    onClick={() => setCurrentStep(0)}
                    variant="outline"
                    className="w-full border-slate-600"
                  >
                    Connect Platforms First
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Expected Earnings */}
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50">
              <CardContent className="pt-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  Expected Earnings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-bold text-yellow-400 mb-1">
                      ${selectedPlatforms.length * 5 - 20}
                    </p>
                    <p className="text-slate-300">First Post (Est.)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400 mb-1">
                      ${selectedPlatforms.length * 50 - 200}
                    </p>
                    <p className="text-slate-300">First Week (Est.)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400 mb-1">
                      ${selectedPlatforms.length * 200 - 800}
                    </p>
                    <p className="text-slate-300">First Month (Est.)</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  * Estimates based on average creator performance. Actual earnings may vary.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'optimize':
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Optimize Your Revenue
            </h3>
            <p className="text-slate-300 mb-6">
              Track performance and maximize your earnings
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    View Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">
                    Track your content performance and earnings across all platforms
                  </p>
                  <Button
                    onClick={() => navigate('/analytics')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Go to Analytics
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Performance Predictor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">
                    Predict how your content will perform before publishing
                  </p>
                  <Button
                    onClick={() => navigate('/ai-tools/performance-predictor')}
                    variant="outline"
                    className="w-full border-slate-600"
                  >
                    Predict Performance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Optimization Tips */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-emerald-400" />
                  Maximize Your Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Post Consistently</p>
                        <p className="text-sm text-slate-400">Daily posts perform 3x better</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Use Analytics</p>
                        <p className="text-sm text-slate-400">Track what works and double down</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Engage Your Audience</p>
                        <p className="text-sm text-slate-400">Build community for long-term revenue</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Cross-Post Strategically</p>
                        <p className="text-sm text-slate-400">Repurpose content across platforms</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Optimize Posting Times</p>
                        <p className="text-sm text-slate-400">Post when your audience is active</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold">Use AI Tools</p>
                        <p className="text-sm text-slate-400">Save time, create more content</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Metrics */}
            {earnings && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">${earnings.total || 0}</p>
                      <p className="text-xs text-slate-400">Total Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{earnings.posts || 0}</p>
                      <p className="text-xs text-slate-400">Posts Published</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{earnings.platforms || 0}</p>
                      <p className="text-xs text-slate-400">Active Platforms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Fast-Track Monetization
            </h1>
          </div>
          <p className="text-xl text-slate-300">
            Get making money in <span className="font-bold text-emerald-400">5 minutes</span>
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">
              Step {currentStep + 1} of {MONETIZATION_STEPS.length}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(((currentStep + 1) / MONETIZATION_STEPS.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / MONETIZATION_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {MONETIZATION_STEPS.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <p className={`text-xs mt-2 text-center ${index <= currentStep ? 'text-white' : 'text-slate-500'}`}>
                  {step.time}
                </p>
              </div>
              {index < MONETIZATION_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 0}
            className="border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {MONETIZATION_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-emerald-500 w-8'
                    : index < currentStep
                    ? 'bg-emerald-500/50'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || publishing}
          >
            {currentStep === MONETIZATION_STEPS.length - 1 ? (
              <>
                Complete Setup
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{selectedPlatforms.length}</p>
              <p className="text-xs text-slate-400">Platforms Selected</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{connectedPlatforms.length}</p>
              <p className="text-xs text-slate-400">Connected</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {contentCreated ? '1' : '0'}
              </p>
              <p className="text-xs text-slate-400">Content Created</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                ${earnings?.total || 0}
              </p>
              <p className="text-xs text-slate-400">Earnings</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FastTrackMonetization;

