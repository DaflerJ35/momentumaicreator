import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { routes } from '../config/routes';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Brain, 
  Copy, 
  BarChart3, 
  Settings, 
  FileText,
  Calendar,
  Video,
  Image as ImageIcon,
  Mic,
  Target,
  Search,
  Archive,
  Link2,
  Send,
  TrendingUp,
  Zap,
  Lightbulb,
  RefreshCw,
  Bot,
  CreditCard,
  DollarSign,
  Mail,
  Users,
  TestTube2,
  History,
  Clock
} from 'lucide-react';

const GlobalSearchContext = createContext(null);

// Searchable content types
const SEARCH_CATEGORIES = {
  PAGES: 'Pages',
  AI_TOOLS: 'AI Tools',
  FEATURES: 'Features',
  ANALYTICS: 'Analytics',
  CONTENT: 'Content',
  SETTINGS: 'Settings',
  GROWTH: 'Growth',
};

// Feature definitions for search
const FEATURES = [
  {
    id: 'content-generation',
    title: 'Content Generation',
    description: 'Generate AI-powered content for all platforms',
    keywords: ['generate', 'content', 'create', 'write', 'text'],
    category: SEARCH_CATEGORIES.AI_TOOLS,
    path: '/ai-tools',
    icon: Copy,
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'View performance metrics and insights',
    keywords: ['analytics', 'metrics', 'stats', 'performance', 'insights', 'data'],
    category: SEARCH_CATEGORIES.ANALYTICS,
    path: '/analytics',
    icon: BarChart3,
  },
  {
    id: 'content-calendar',
    title: 'Content Calendar',
    description: 'Schedule and manage your content',
    keywords: ['calendar', 'schedule', 'plan', 'timeline', 'publish'],
    category: SEARCH_CATEGORIES.CONTENT,
    path: '/ai-tools/content-calendar',
    icon: Calendar,
  },
  {
    id: 'video-studio',
    title: 'Video Studio',
    description: 'Create and edit videos with AI',
    keywords: ['video', 'edit', 'create video', 'studio'],
    category: SEARCH_CATEGORIES.AI_TOOLS,
    path: '/ai-tools/video-studio',
    icon: Video,
  },
  {
    id: 'image-studio',
    title: 'Image Studio',
    description: 'Generate and edit images with AI',
    keywords: ['image', 'photo', 'picture', 'generate image', 'edit image'],
    category: SEARCH_CATEGORIES.AI_TOOLS,
    path: '/ai-tools/image-studio',
    icon: ImageIcon,
  },
  {
    id: 'voice-studio',
    title: 'Voice Studio',
    description: 'Generate voiceovers and audio content',
    keywords: ['voice', 'audio', 'speech', 'voiceover', 'sound'],
    category: SEARCH_CATEGORIES.AI_TOOLS,
    path: '/ai-tools/voice-studio',
    icon: Mic,
  },
  {
    id: 'neural-strategist',
    title: 'Neural Strategist',
    description: 'AI-powered marketing strategy generator',
    keywords: ['strategy', 'marketing', 'plan', 'campaign', 'strategist'],
    category: SEARCH_CATEGORIES.AI_TOOLS,
    path: '/ai-tools/neural-strategist',
    icon: Brain,
  },
  {
    id: 'neural-multiplier',
    title: 'Neural Multiplier',
    description: 'Transform content for multiple platforms',
    keywords: ['multiply', 'transform', 'adapt', 'platform', 'repurpose'],
    category: SEARCH_CATEGORIES.AI_TOOLS,
    path: '/ai-tools/neural-multiplier',
    icon: RefreshCw,
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Browse AI models, templates, and plugins',
    keywords: ['marketplace', 'shop', 'buy', 'templates', 'plugins', 'models'],
    category: SEARCH_CATEGORIES.GROWTH,
    path: '/growth/marketplace',
    icon: Archive,
  },
  {
    id: 'team-management',
    title: 'Team Management',
    description: 'Manage your team and collaborators',
    keywords: ['team', 'collaborate', 'members', 'users', 'manage team'],
    category: SEARCH_CATEGORIES.SETTINGS,
    path: '/team/manage',
    icon: Users,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with external platforms and services',
    keywords: ['integrations', 'connect', 'api', 'platforms', 'services'],
    category: SEARCH_CATEGORIES.FEATURES,
    path: '/integrations',
    icon: Link2,
  },
  {
    id: 'publish',
    title: 'Publish Content',
    description: 'Publish content to multiple platforms',
    keywords: ['publish', 'post', 'share', 'distribute', 'send'],
    category: SEARCH_CATEGORIES.CONTENT,
    path: '/publish',
    icon: Send,
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Manage your subscription and billing',
    keywords: ['billing', 'payment', 'subscription', 'invoice', 'plan'],
    category: SEARCH_CATEGORIES.SETTINGS,
    path: '/billing',
    icon: CreditCard,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure your account and preferences',
    keywords: ['settings', 'preferences', 'config', 'account', 'profile'],
    category: SEARCH_CATEGORIES.SETTINGS,
    path: '/settings',
    icon: Settings,
  },
];

export const GlobalSearchProvider = ({ children }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Build searchable items from routes and features
  const searchableItems = useMemo(() => {
    const items = [];

    // Add routes as pages
    routes.forEach(route => {
      if (route.title && route.path && route.path !== '*') {
        items.push({
          id: `route-${route.path}`,
          title: route.title,
          description: route.category ? `Navigate to ${route.title}` : '',
          path: route.path,
          category: SEARCH_CATEGORIES.PAGES,
          icon: route.icon || Home,
          keywords: [
            route.title.toLowerCase(),
            route.path.toLowerCase(),
            route.category?.toLowerCase() || '',
          ].filter(Boolean),
        });
      }
    });

    // Add features
    FEATURES.forEach(feature => {
      items.push({
        id: `feature-${feature.id}`,
        title: feature.title,
        description: feature.description,
        path: feature.path,
        category: feature.category,
        icon: feature.icon,
        keywords: [
          feature.title.toLowerCase(),
          feature.description.toLowerCase(),
          ...feature.keywords,
        ],
      });
    });

    return items;
  }, []);

  // Search function
  const search = useCallback((query) => {
    if (!query || !query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryTerms = normalizedQuery.split(/\s+/);

    return searchableItems
      .map(item => {
        // Calculate relevance score
        let score = 0;

        // Exact title match
        if (item.title.toLowerCase() === normalizedQuery) {
          score += 100;
        }
        // Title starts with query
        else if (item.title.toLowerCase().startsWith(normalizedQuery)) {
          score += 50;
        }
        // Title contains query
        else if (item.title.toLowerCase().includes(normalizedQuery)) {
          score += 30;
        }

        // Description contains query
        if (item.description.toLowerCase().includes(normalizedQuery)) {
          score += 20;
        }

        // Keyword matching
        queryTerms.forEach(term => {
          item.keywords.forEach(keyword => {
            if (keyword.includes(term)) {
              score += 10;
            }
            if (keyword === term) {
              score += 5;
            }
          });
        });

        // Path matching
        if (item.path.toLowerCase().includes(normalizedQuery)) {
          score += 15;
        }

        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit to top 20 results
  }, [searchableItems]);

  // Navigate to search result
  const navigateToResult = useCallback((item) => {
    if (item.path) {
      navigate(item.path);
      setSearchQuery('');
    }
  }, [navigate]);

  const value = {
    searchQuery,
    setSearchQuery,
    search,
    navigateToResult,
    searchableItems,
    categories: SEARCH_CATEGORIES,
  };

  return (
    <GlobalSearchContext.Provider value={value}>
      {children}
    </GlobalSearchContext.Provider>
  );
};

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    // Return mock values if context is not available
    return {
      searchQuery: '',
      setSearchQuery: () => {},
      search: () => [],
      navigateToResult: () => {},
      searchableItems: [],
      categories: SEARCH_CATEGORIES,
    };
  }
  return context;
};

export default GlobalSearchContext;

