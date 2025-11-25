import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Brain, Sparkles, Wand2, Copy, BarChart2, Zap, Clock, Lightbulb, Bot, Video, RefreshCw, ImageIcon, Mic, Target, Search, Archive } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ShimmerCard, Floating, MagneticButton, PulseGlow } from '../../components/ui/micro-interactions';
import { useAI } from '../../contexts/AIContext';

const tools = [
  {
    id: 'neural-strategist',
    title: 'Neural Strategist',
    description: 'AI-powered content strategy and ideation tool that generates comprehensive roadmaps',
    icon: Brain,
    path: '/ai-tools/neural-strategist',
    color: 'emerald',
    gradient: 'from-emerald-500 to-cyan-500',
  },
  {
    id: 'neural-multiplier',
    title: 'Neural Multiplier',
    description: 'Transform one piece of content into multiple platform-specific formats',
    icon: Copy,
    path: '/ai-tools/neural-multiplier',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'content-transform',
    title: 'AI Content Transform',
    description: 'Repurpose and transform content with various styles and tones',
    icon: RefreshCw,
    path: '/ai-tools/content-transform',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'creator-hub',
    title: 'Creator Hub',
    description: 'Personalized AI writing assistant trained on your unique style',
    icon: Bot,
    path: '/ai-tools/creator-hub',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'trend-analyzer',
    title: 'Trend Analyzer',
    description: 'Discover trending topics and insights in your niche',
    icon: BarChart2,
    path: '/ai-tools/trend-analyzer',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'hashtag-generator',
    title: 'Hashtag Generator',
    description: 'Generate high-performing hashtags optimized for your content',
    icon: Zap,
    path: '/ai-tools/hashtag-generator',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'content-calendar',
    title: 'Content Calendar',
    description: 'Plan and schedule your content strategy with AI-powered suggestions',
    icon: Clock,
    path: '/ai-tools/content-calendar',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    id: 'idea-generator',
    title: 'Idea Generator',
    description: 'Get unlimited content ideas tailored to your niche and audience',
    icon: Lightbulb,
    path: '/ai-tools/idea-generator',
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'video-studio',
    title: 'Video Studio',
    description: 'AI-powered video generation and editing tool',
    icon: Video,
    path: '/ai-tools/video-studio',
    color: 'red',
    gradient: 'from-red-500 to-rose-500',
  },
  {
    id: 'image-studio',
    title: 'Image Studio',
    description: 'AI-powered image generation and editing with multiple styles',
    icon: ImageIcon,
    path: '/ai-tools/image-studio',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'voice-studio',
    title: 'Voice Studio',
    description: 'Generate professional voice overs with AI text-to-speech',
    icon: Mic,
    path: '/ai-tools/voice-studio',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'performance-predictor',
    title: 'Performance Predictor',
    description: 'Predict content engagement and performance before publishing',
    icon: Target,
    path: '/ai-tools/performance-predictor',
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    id: 'seo-optimizer',
    title: 'SEO Optimizer',
    description: 'AI-powered SEO analysis and content optimization',
    icon: Search,
    path: '/ai-tools/seo-optimizer',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'content-repurposing-pipeline',
    title: 'Content Repurposing Pipeline',
    description: 'Automatically transform content across multiple platforms',
    icon: RefreshCw,
    path: '/ai-tools/content-repurposing-pipeline',
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'smart-content-library',
    title: 'Smart Content Library',
    description: 'AI-powered content discovery and organization system',
    icon: Archive,
    path: '/ai-tools/smart-content-library',
    color: 'slate',
    gradient: 'from-slate-500 to-gray-500',
  }
];

// Enhanced tool card with 3D tilt effect
const ToolCard = ({ tool, index, onNavigate }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const Icon = tool.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        type: "spring",
        stiffness: 100,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="h-full perspective-1000"
    >
      <motion.div
        className="glass-card card-3d interactive-card h-full flex flex-col rounded-xl p-6 relative overflow-hidden group"
        whileHover={{ scale: 1.02, z: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
          animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
        />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        />

        {/* Glow effect */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
        />

        <div className="relative z-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} bg-opacity-20 backdrop-blur-sm border border-${tool.color}-500/30`}
              animate={isHovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <Icon className={`h-6 w-6 text-${tool.color}-400`} />
            </motion.div>
          </div>
          
          <motion.h3
            className="text-xl font-bold text-white mt-4 mb-2"
            animate={isHovered ? { x: 5 } : { x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {tool.title}
          </motion.h3>
          
          <p className="text-slate-300 text-sm leading-relaxed">
            {tool.description}
          </p>
        </div>

        <div className="mt-auto pt-4 relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              className={`w-full btn-premium bg-gradient-to-r ${tool.gradient} border-0 text-white shadow-lg shadow-${tool.color}-500/50`}
              onClick={() => onNavigate(tool.path)}
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                animate={isHovered ? { x: 5 } : { x: 0 }}
              >
                Open Tool
                <motion.span
                  animate={isHovered ? { x: 5, opacity: 1 } : { x: 0, opacity: 0.7 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  →
                </motion.span>
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AIToolsHubEnhanced = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const { modelSettings, updateModelSettings } = useAI();

  const handleProviderChange = (event) => {
    const value = event.target.value || null;
    updateModelSettings({ provider: value });
  };

  const handleKbListChange = (event) => {
    const raw = event.target.value || '';
    const kbList = raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    updateModelSettings({ kbList });
  };

  const currentProvider = modelSettings?.provider || '';
  const kbInputValue = (modelSettings?.kbList || []).join(', ');

  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolClick = (path) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      {/* Enhanced Header with floating animation */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <Floating intensity={5} duration={4}>
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-emerald-500/30"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                  "0 0 40px rgba(16, 185, 129, 0.6)",
                  "0 0 20px rgba(16, 185, 129, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="h-8 w-8 text-emerald-400" />
            </motion.div>
            <div>
              <motion.h1
                className="text-5xl font-bold gradient-text mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                AI Tools Hub
              </motion.h1>
              <motion.p
                className="text-xl text-slate-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Supercharge your content creation with our AI-powered tools
              </motion.p>
            </div>
          </div>
        </Floating>
      </motion.div>

      {/* Enhanced Search Bar */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <MagneticButton strength={0.2}>
          <div className="relative max-w-xl">
            <motion.input
              type="text"
              placeholder="Search AI tools..."
              className="input-premium pl-12 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              whileFocus={{ scale: 1.02, boxShadow: "0 0 30px rgba(16, 185, 129, 0.3)" }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400"
              animate={searchQuery ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Search className="h-5 w-5" />
            </motion.div>
            {searchQuery && (
              <motion.button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setSearchQuery('')}
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            )}
          </div>
        </MagneticButton>
      </motion.div>

      {/* AI Provider / Knowledge Base selector */}
      <motion.div
        className="mb-8 grid gap-4 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="glass-card rounded-xl p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">AI Provider</span>
          <select
            value={currentProvider}
            onChange={handleProviderChange}
            className="input-premium bg-slate-900/60 border border-slate-700 text-sm"
          >
            <option value="">Auto (server default)</option>
            <option value="ollama">Ollama</option>
            <option value="gemini">Gemini</option>
            <option value="flowith">Flowith / Neo</option>
          </select>
          <p className="text-xs text-slate-400">
            Choose which backend provider powers your AI tools.
          </p>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Flowith Knowledge Bases</span>
          <input
            type="text"
            value={kbInputValue}
            onChange={handleKbListChange}
            className="input-premium text-sm"
            placeholder="kb_123, kb_456 (optional)"
          />
          <p className="text-xs text-slate-400">
            Comma-separated Flowith/Neo KB IDs used when Flowith is selected.
          </p>
        </div>
      </motion.div>

      {/* Tools Grid with Stagger Animation */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <AnimatePresence mode="wait">
          {filteredTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              index={index}
              onNavigate={handleToolClick}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced CTA Section */}
      <motion.div
        className="mt-12 glass-card rounded-xl p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-500/30 mb-6"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="h-8 w-8 text-emerald-400" />
          </motion.div>
          
          <motion.h3
            className="text-2xl font-bold gradient-text mb-3"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            More AI Tools Coming Soon
          </motion.h3>
          
          <p className="text-slate-300 mb-8 text-lg">
            We're constantly adding new AI-powered tools to help you create better content faster.
          </p>
          
          <MagneticButton>
            <Button className="btn-premium">
              Request a Feature
            </Button>
          </MagneticButton>
        </div>
      </motion.div>
    </div>
  );
};

export default AIToolsHubEnhanced;

