import { lazy } from 'react';
import {
  Home,
  BarChart3,
  Settings,
  CreditCard,
  DollarSign,
  Mail,
} from 'lucide-react';

// Lazy load page components
const LandingPage = lazy(() => import('../pages/general/LandingPage'));
const Dashboard = lazy(() => import('../pages/general/Dashboard'));
const Analytics = lazy(() => import('../pages/analytics/Analytics'));
const SettingsPage = lazy(() => import('../pages/account/Settings'));
const Billing = lazy(() => import('../pages/account/Billing'));
const Pricing = lazy(() => import('../pages/pricing/Pricing'));
const Contact = lazy(() => import('../pages/general/Contact'));
const NotFound = lazy(() => import('../pages/NotFound'));

// AI Tools
const AIToolsHub = lazy(() => import('../pages/ai-tools/AIToolsHub'));
const NeuralStrategist = lazy(() => import('../pages/ai-tools/NeuralStrategist'));
const NeuralMultiplier = lazy(() => import('../pages/ai-tools/NeuralMultiplier'));
const AIContentTransform = lazy(() => import('../pages/ai-tools/AIContentTransform'));
const CreatorHub = lazy(() => import('../pages/ai-tools/CreatorHub'));
const TrendAnalyzer = lazy(() => import('../pages/ai-tools/TrendAnalyzer'));
const HashtagGenerator = lazy(() => import('../pages/ai-tools/HashtagGenerator'));
const ContentCalendar = lazy(() => import('../pages/ai-tools/ContentCalendar'));
const IdeaGenerator = lazy(() => import('../pages/ai-tools/IdeaGenerator'));
const VideoStudio = lazy(() => import('../pages/ai-tools/VideoStudio'));
const ImageStudio = lazy(() => import('../pages/ai-tools/ImageStudio'));
const VoiceStudio = lazy(() => import('../pages/ai-tools/VoiceStudio'));
const PerformancePredictor = lazy(() => import('../pages/ai-tools/PerformancePredictor'));
const SEOOptimizer = lazy(() => import('../pages/ai-tools/SEOOptimizer'));
const ContentRepurposingPipeline = lazy(() => import('../pages/ai-tools/ContentRepurposingPipeline'));
const SmartContentLibrary = lazy(() => import('../pages/ai-tools/SmartContentLibrary'));
const Marketplace = lazy(() => import('../pages/growth/Marketplace'));
const Referrals = lazy(() => import('../pages/growth/Referrals'));
const TeamManagement = lazy(() => import('../pages/team/TeamManagement'));

export const routes = [
  {
    path: '/',
    element: Dashboard,
    title: 'Dashboard',
    icon: Home,
    showInNav: true,
    category: 'main',
    protected: true
  },
  {
    path: '/dashboard',
    element: Dashboard,
    title: 'Dashboard',
    icon: Home,
    showInNav: true,
    category: 'main',
    protected: true
  },
  {
    path: '/analytics',
    element: Analytics,
    title: 'Analytics',
    icon: BarChart3,
    showInNav: true,
    category: 'main',
    protected: true
  },
  {
    path: '/pricing',
    element: Pricing,
    title: 'Pricing',
    icon: DollarSign,
    showInNav: true,
    category: 'growth',
    protected: false
  },
  {
    path: '/contact',
    element: Contact,
    title: 'Contact',
    icon: Mail,
    showInNav: false,
    protected: false
  },
  {
    path: '/settings',
    element: SettingsPage,
    title: 'Settings',
    icon: Settings,
    showInNav: true,
    category: 'settings',
    protected: true
  },
  {
    path: '/billing',
    element: Billing,
    title: 'Billing',
    icon: CreditCard,
    showInNav: true,
    category: 'settings',
    protected: true
  },
  {
    path: '/ai-tools',
    element: AIToolsHub,
    title: 'AI Tools Hub',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/neural-strategist',
    element: NeuralStrategist,
    title: 'Neural Strategist',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/neural-multiplier',
    element: NeuralMultiplier,
    title: 'Neural Multiplier',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/content-transform',
    element: AIContentTransform,
    title: 'AI Content Transform',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/creator-hub',
    element: CreatorHub,
    title: 'Creator Hub',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/trend-analyzer',
    element: TrendAnalyzer,
    title: 'Trend Analyzer',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/hashtag-generator',
    element: HashtagGenerator,
    title: 'Hashtag Generator',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/content-calendar',
    element: ContentCalendar,
    title: 'Content Calendar',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/idea-generator',
    element: IdeaGenerator,
    title: 'Idea Generator',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/video-studio',
    element: VideoStudio,
    title: 'Video Studio',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/image-studio',
    element: ImageStudio,
    title: 'Image Studio',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/voice-studio',
    element: VoiceStudio,
    title: 'Voice Studio',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/performance-predictor',
    element: PerformancePredictor,
    title: 'Performance Predictor',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/seo-optimizer',
    element: SEOOptimizer,
    title: 'SEO Optimizer',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/content-repurposing-pipeline',
    element: ContentRepurposingPipeline,
    title: 'Content Repurposing Pipeline',
    showInNav: false,
    protected: true
  },
  {
    path: '/ai-tools/smart-content-library',
    element: SmartContentLibrary,
    title: 'Smart Content Library',
    showInNav: false,
    protected: true
  },
  {
    path: '/growth/marketplace',
    element: Marketplace,
    title: 'Marketplace',
    category: 'growth',
    showInNav: true,
    protected: true
  },
  {
    path: '/growth/referrals',
    element: Referrals,
    title: 'Referrals',
    category: 'growth',
    showInNav: true,
    protected: true
  },
  {
    path: '/team/manage',
    element: TeamManagement,
    title: 'Team',
    category: 'account',
    showInNav: true,
    protected: true
  },
  {
    path: '*',
    element: NotFound,
    title: 'Not Found',
    showInNav: false,
    protected: false
  }
];

export default routes;
