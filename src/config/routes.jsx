import { lazy } from 'react';
import {
  Home,
  BarChart3,
  Settings,
  CreditCard,
  DollarSign,
  Mail,
  Brain,
  Copy,
  RefreshCw,
  Bot,
  TrendingUp,
  Zap,
  Clock,
  Lightbulb,
  Video,
  Image as ImageIcon,
  Mic,
  Target,
  Search,
  Archive,
  FileText,
  Calendar,
  History,
  TestTube2,
  Link2,
  Send,
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
const PlatformIntegrations = lazy(() => import('../pages/integrations/PlatformIntegrations'));
const ContentPublisher = lazy(() => import('../pages/content/ContentPublisher'));

export const routes = [
  {
    path: '/',
    element: LandingPage,
    title: 'Home',
    showInNav: false,
    protected: false
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
    category: 'content',
    protected: true
  },
  {
    path: '/templates',
    element: AIToolsHub,
    title: 'Templates',
    icon: FileText,
    showInNav: true,
    category: 'content',
    protected: true
  },
  {
    path: '/history',
    element: AIToolsHub,
    title: 'History',
    icon: History,
    showInNav: true,
    category: 'content',
    protected: true
  },
  {
    path: '/ab-testing',
    element: AIToolsHub,
    title: 'A/B Testing',
    icon: TestTube2,
    showInNav: true,
    category: 'advanced',
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
    icon: Brain,
    showInNav: true,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/neural-multiplier',
    element: NeuralMultiplier,
    title: 'Neural Multiplier',
    icon: Copy,
    showInNav: true,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/content-transform',
    element: AIContentTransform,
    title: 'Content Transformer',
    icon: RefreshCw,
    showInNav: true,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/creator-hub',
    element: CreatorHub,
    title: 'Creator Hub',
    icon: Bot,
    showInNav: true,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/trend-analyzer',
    element: TrendAnalyzer,
    title: 'AI Analyzer',
    icon: TrendingUp,
    showInNav: true,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/hashtag-generator',
    element: HashtagGenerator,
    title: 'Hashtag Generator',
    icon: Zap,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/content-calendar',
    element: ContentCalendar,
    title: 'Schedule',
    icon: Calendar,
    showInNav: true,
    category: 'content',
    protected: true
  },
  {
    path: '/ai-tools/idea-generator',
    element: IdeaGenerator,
    title: 'Idea Generator',
    icon: Lightbulb,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/video-studio',
    element: VideoStudio,
    title: 'Video Studio',
    icon: Video,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/image-studio',
    element: ImageStudio,
    title: 'Image Studio',
    icon: ImageIcon,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/voice-studio',
    element: VoiceStudio,
    title: 'Voice Studio',
    icon: Mic,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/performance-predictor',
    element: PerformancePredictor,
    title: 'Performance Predictor',
    icon: Target,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/seo-optimizer',
    element: SEOOptimizer,
    title: 'SEO Optimizer',
    icon: Search,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/content-repurposing-pipeline',
    element: ContentRepurposingPipeline,
    title: 'Content Pipeline',
    icon: RefreshCw,
    showInNav: false,
    category: 'ai',
    protected: true
  },
  {
    path: '/ai-tools/smart-content-library',
    element: SmartContentLibrary,
    title: 'Content Library',
    icon: Archive,
    showInNav: false,
    category: 'ai',
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
    path: '/integrations',
    element: PlatformIntegrations,
    title: 'Integrations',
    icon: Link2,
    showInNav: true,
    category: 'main',
    protected: true
  },
  {
    path: '/publish',
    element: ContentPublisher,
    title: 'Publish',
    icon: Send,
    showInNav: true,
    category: 'main',
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
