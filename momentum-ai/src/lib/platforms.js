// Social Media Platforms Configuration
// This is a SAAS platform - all platforms must be integrated

export const PLATFORMS = {
  // Creator/Subscription Platforms
  onlyfans: {
    id: 'onlyfans',
    name: 'OnlyFans',
    icon: '💎',
    color: '#00AFF0',
    category: 'subscription',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'messages', 'media', 'subscriptions', 'tips', 'polls'],
    apiRequired: true,
    maxPostLength: 10000,
    supportedMedia: ['image', 'video'],
  },
  fansly: {
    id: 'fansly',
    name: 'Fansly',
    icon: '🌟',
    color: '#FF6B6B',
    category: 'subscription',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'messages', 'media', 'subscriptions', 'tips', 'livestream'],
    apiRequired: true,
    maxPostLength: 10000,
    supportedMedia: ['image', 'video'],
  },
  fanvue: {
    id: 'fanvue',
    name: 'Fanvue',
    icon: '💫',
    color: '#8B5CF6',
    category: 'subscription',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'messages', 'media', 'subscriptions', 'tips'],
    apiRequired: true,
    maxPostLength: 10000,
    supportedMedia: ['image', 'video'],
  },
  fanplace: {
    id: 'fanplace',
    name: 'Fanplace',
    icon: '✨',
    color: '#10B981',
    category: 'subscription',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'messages', 'media', 'subscriptions'],
    apiRequired: true,
    maxPostLength: 10000,
    supportedMedia: ['image', 'video'],
  },
  
  // Social Media Platforms
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    category: 'social',
    enabled: true,
    features: ['posts', 'stories', 'reels', 'igtv', 'carousel'],
    apiRequired: true,
    maxPostLength: 2200,
    maxHashtags: 30,
    supportedMedia: ['image', 'video'],
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    icon: '🐦',
    color: '#1DA1F2',
    category: 'social',
    enabled: true,
    features: ['tweets', 'threads', 'media', 'spaces'],
    apiRequired: true,
    maxPostLength: 280,
    maxThreadLength: 25,
    supportedMedia: ['image', 'video', 'gif'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    category: 'social',
    enabled: true,
    features: ['videos', 'duets', 'livestream'],
    apiRequired: true,
    maxPostLength: 150,
    maxVideoLength: 600, // seconds
    supportedMedia: ['video'],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    category: 'social',
    enabled: true,
    features: ['videos', 'shorts', 'livestream', 'community', 'posts'],
    apiRequired: true,
    maxPostLength: 5000,
    maxVideoLength: 43200, // seconds (12 hours)
    supportedMedia: ['video', 'image'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    category: 'social',
    enabled: true,
    features: ['posts', 'stories', 'reels', 'groups', 'pages'],
    apiRequired: true,
    maxPostLength: 63206,
    supportedMedia: ['image', 'video'],
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    category: 'social',
    enabled: true,
    features: ['posts', 'articles', 'carousel', 'video'],
    apiRequired: true,
    maxPostLength: 3000,
    supportedMedia: ['image', 'video', 'document'],
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: '#BD081C',
    category: 'social',
    enabled: false, // OAuth implementation coming soon
    features: ['pins', 'boards', 'idea pins'],
    apiRequired: true,
    maxPostLength: 500,
    supportedMedia: ['image', 'video'],
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    color: '#000000',
    category: 'social',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'threads', 'media'],
    apiRequired: true,
    maxPostLength: 500,
    supportedMedia: ['image', 'video'],
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat',
    icon: '👻',
    color: '#FFFC00',
    category: 'social',
    enabled: false, // OAuth implementation coming soon
    features: ['snaps', 'stories', 'spots'],
    apiRequired: true,
    maxPostLength: 250,
    supportedMedia: ['image', 'video'],
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: '#FF4500',
    category: 'social',
    enabled: true,
    features: ['posts', 'comments', 'subreddits'],
    apiRequired: true,
    maxPostLength: 40000,
    supportedMedia: ['image', 'video', 'link'],
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    icon: '💬',
    color: '#5865F2',
    category: 'social',
    enabled: true,
    features: ['messages', 'channels', 'servers'],
    apiRequired: true,
    maxPostLength: 2000,
    supportedMedia: ['image', 'video', 'file'],
  },
  
  // Blog Platforms
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    icon: '📝',
    color: '#21759B',
    category: 'blog',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'pages', 'media', 'categories'],
    apiRequired: true,
    maxPostLength: 100000,
    supportedMedia: ['image', 'video', 'audio'],
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    icon: '📰',
    color: '#000000',
    category: 'blog',
    enabled: true,
    features: ['articles', 'publications', 'series'],
    apiRequired: true,
    maxPostLength: 100000,
    supportedMedia: ['image'],
  },
  substack: {
    id: 'substack',
    name: 'Substack',
    icon: '📧',
    color: '#FF6719',
    category: 'blog',
    enabled: true,
    features: ['posts', 'newsletters', 'comments'],
    apiRequired: true,
    maxPostLength: 100000,
    supportedMedia: ['image', 'video'],
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    icon: '👻',
    color: '#15171A',
    category: 'blog',
    enabled: false, // OAuth implementation coming soon
    features: ['posts', 'pages', 'newsletters'],
    apiRequired: true,
    maxPostLength: 100000,
    supportedMedia: ['image', 'video'],
  },
  
  // Additional Platforms
  patreon: {
    id: 'patreon',
    name: 'Patreon',
    icon: '🎨',
    color: '#F96854',
    category: 'subscription',
    enabled: true,
    features: ['posts', 'tiers', 'media'],
    apiRequired: true,
    maxPostLength: 10000,
    supportedMedia: ['image', 'video'],
  },
  ko_fi: {
    id: 'ko_fi',
    name: 'Ko-fi',
    icon: '☕',
    color: '#FF5E5B',
    category: 'subscription',
    enabled: true,
    features: ['posts', 'commissions', 'shop'],
    apiRequired: true,
    maxPostLength: 10000,
    supportedMedia: ['image', 'video'],
  },
};

// Get platforms by category
export const getPlatformsByCategory = (category) => {
  return Object.values(PLATFORMS).filter(p => p.category === category);
};

// Get all enabled platforms
export const getEnabledPlatforms = () => {
  return Object.values(PLATFORMS).filter(p => p.enabled);
};

// Get platform by ID
export const getPlatform = (id) => {
  return PLATFORMS[id];
};

// Platform categories
export const CATEGORIES = {
  subscription: 'Subscription Platforms',
  social: 'Social Media',
  blog: 'Blog Platforms',
};

