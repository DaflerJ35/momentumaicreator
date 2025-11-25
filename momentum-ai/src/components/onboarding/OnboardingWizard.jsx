/**
 * Onboarding Wizard - Fast-Track Users to Making Money
 * Guides new users through setup in 3-5 minutes
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CreditCard, 
  Share2, 
  TrendingUp,
  Zap,
  DollarSign,
  Rocket,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, NOTIFICATION_TYPES } from '../../contexts/NotificationContext';
import { toast } from 'sonner';
import { database, ref, set, get } from '../../lib/firebase';
import { Badge } from '../ui/badge';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Momentum AI!',
    description: 'Let\'s get you making money in 3 minutes',
    icon: Rocket,
    content: 'welcome'
  },
  {
    id: 'connect-platforms',
    title: 'Connect Your Platforms',
    description: 'Connect your social media and subscription platforms to start earning',
    icon: Share2,
    content: 'platforms'
  },
  {
    id: 'create-content',
    title: 'Create Your First Content',
    description: 'Use AI to generate content that converts',
    icon: Sparkles,
    content: 'content'
  },
  {
    id: 'publish',
    title: 'Publish & Monetize',
    description: 'Publish your content and start making money',
    icon: DollarSign,
    content: 'publish'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start creating and earning',
    icon: CheckCircle2,
    content: 'complete'
  }
];

const BADGE_CONFIG = {
  welcome: {
    id: 'welcome',
    label: 'Launchpad Ready',
    description: 'Kicked off the fast-track journey',
  },
  'connect-platforms': {
    id: 'connect-platforms',
    label: 'Platform Pro',
    description: 'Connected your first platform',
  },
  'create-content': {
    id: 'create-content',
    label: 'Creative Spark',
    description: 'Generated AI-powered content',
  },
  publish: {
    id: 'publish',
    label: 'Momentum Maker',
    description: 'Published with Momentum AI',
  },
  complete: {
    id: 'complete',
    label: 'Momentum Starter',
    description: 'Finished onboarding and earned XP',
  },
};

const OnboardingWizard = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { createNotification } = useNotifications();

  const trackProgress = (stepId) => {
    if (!stepId) return;

    setCompletedSteps((prev) =>
      prev.includes(stepId) ? prev : [...prev, stepId]
    );

    const badge = BADGE_CONFIG[stepId];
    if (badge) {
      setEarnedBadges((prev) =>
        prev.some((item) => item.id === badge.id) ? prev : [...prev, badge]
      );
    }
  };

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!currentUser || !database) return;
      
      try {
        const userRef = ref(database, `users/${currentUser.uid}/onboarding`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists() && snapshot.val().completed) {
          // User has completed onboarding, don't show wizard
          if (onClose) onClose();
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [currentUser, onClose]);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', category: 'social' },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', category: 'social' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'social' },
    { id: 'facebook', name: 'Facebook', icon: '👥', category: 'social' },
    { id: 'onlyfans', name: 'OnlyFans', icon: '💰', category: 'subscription' },
    { id: 'fansly', name: 'Fansly', icon: '🌟', category: 'subscription' },
    { id: 'fanvue', name: 'Fanvue', icon: '💎', category: 'subscription' },
  ];

  const handleNext = () => {
    const currentStepId = STEPS[currentStep].id;
    trackProgress(currentStepId);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
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
      // Mark onboarding as complete
      if (currentUser && database) {
        const userRef = ref(database, `users/${currentUser.uid}/onboarding`);
        await set(userRef, {
          completed: true,
          completedAt: Date.now(),
          connectedPlatforms: selectedPlatforms,
        });
      }

      trackProgress(STEPS[currentStep].id);
      trackProgress('complete');

      toast.success('Onboarding complete! Let\'s start making money! 🚀');
      createNotification?.({
        type: NOTIFICATION_TYPES.GAMIFIED,
        title: 'Momentum Starter badge unlocked',
        message: 'You completed onboarding and earned +120 XP.',
      });
      
      if (onComplete) {
        onComplete();
      } else {
        navigate('/dashboard');
      }
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save onboarding progress');
    }
  };

  const handleSkip = () => {
    if (onClose) onClose();
    navigate('/dashboard');
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

  const handleConnectPlatform = (platformId) => {
    // Navigate to platform integration page
    navigate(`/integrations?platform=${platformId}`);
    toast.info(`Connecting ${platforms.find(p => p.id === platformId)?.name}...`);
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    const activeBadge = BADGE_CONFIG[step.id];
    
    switch (step.content) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            {activeBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm font-semibold mx-auto">
                <Sparkles className="w-4 h-4" />
                {activeBadge.label}
              </div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <Rocket className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to Momentum AI! 🚀
            </h2>
            <p className="text-slate-300 text-lg mb-6">
              We'll help you set up your account in just 3 minutes and get you making money fast.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300">Fast Setup</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300">Start Earning</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300">AI-Powered</p>
              </div>
            </div>
          </div>
        );

      case 'platforms':
        return (
          <div className="space-y-6">
            {activeBadge && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{activeBadge.label}</p>
                  <p className="text-xs text-emerald-200/80">{activeBadge.description}</p>
                </div>
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Connect Your Money-Making Platforms
              </h3>
              <p className="text-slate-400 text-sm">
                Select the platforms where you want to publish content and make money
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <motion.button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div className="text-left">
                        <p className="font-semibold text-white">{platform.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{platform.category}</p>
                      </div>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedPlatforms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4"
              >
                <p className="text-sm text-emerald-400">
                  ✅ {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  You can connect them after onboarding or we'll guide you through it
                </p>
              </motion.div>
            )}
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6 text-center">
            {activeBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm font-semibold mx-auto">
                <Sparkles className="w-4 h-4" />
                {activeBadge.label}
              </div>
            )}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Create Your First AI Content
            </h3>
            <p className="text-slate-300 mb-6">
              Our AI will help you create content that converts and makes money
            </p>
            
            <div className="grid grid-cols-1 gap-4 mt-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-2">Neural Multiplier</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Transform one piece of content into multiple formats for all your platforms
                  </p>
                  <Button 
                    onClick={() => {
                      navigate('/ai-tools/neural-multiplier');
                      handleComplete();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Try Neural Multiplier
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-white mb-2">Content Ideas</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Get unlimited content ideas tailored to your niche
                  </p>
                  <Button 
                    onClick={() => {
                      navigate('/ai-tools/idea-generator');
                      handleComplete();
                    }}
                    variant="outline"
                    className="w-full border-slate-600"
                  >
                    Get Content Ideas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'publish':
        return (
          <div className="space-y-6 text-center">
            {activeBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm font-semibold mx-auto">
                <Sparkles className="w-4 h-4" />
                {activeBadge.label}
              </div>
            )}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              Publish & Start Making Money
            </h3>
            <p className="text-slate-300 mb-6">
              Publish your content to all your connected platforms with one click
            </p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Content Created</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Platforms Connected</span>
                <span className="text-emerald-400 font-semibold">{selectedPlatforms.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Ready to Publish</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            <Button 
              onClick={() => {
                navigate('/content/publisher');
                handleComplete();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
              size="lg"
            >
              Go to Content Publisher 🚀
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center">
            {activeBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 text-sm font-semibold mx-auto">
                <Sparkles className="w-4 h-4" />
                {activeBadge.label}
              </div>
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-4">
              You're All Set! 🎉
            </h3>
            <p className="text-slate-300 text-lg mb-6">
              You're ready to start creating content and making money
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button 
                onClick={() => {
                  navigate('/dashboard');
                  handleComplete();
                }}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => {
                  navigate('/ai-tools/neural-multiplier');
                  handleComplete();
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Create Content
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && currentStep === 0) {
            handleSkip();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {STEPS[currentStep].description}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-xs text-slate-400">
                {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <motion.div
                className="bg-emerald-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="px-6 py-4 flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isComplete = completedSteps.includes(step.id) || index < currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex-1 flex items-center ${
                    index < STEPS.length - 1 ? 'mr-2' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        isComplete ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {earnedBadges.length > 0 && (
            <div className="px-6 pb-2">
              <p className="text-[11px] uppercase tracking-wide text-emerald-400 mb-2">
                Badges unlocked
              </p>
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map((badge) => (
                  <Badge
                    key={badge.id}
                    variant="success"
                    className="bg-emerald-500/10 border-emerald-400/30 text-emerald-200 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 pb-6">
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
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 0}
              className="border-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              Skip for now
            </Button>

            <Button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingWizard;

