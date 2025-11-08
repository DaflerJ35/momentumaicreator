import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  Copy, 
  Loader2, 
  Check, 
  AlertCircle, 
  Settings, 
  Zap, 
  FileText, 
  Share2,
  Download,
  TrendingUp,
  BarChart3,
  Link2
} from 'lucide-react';
import { useAI } from '../../contexts/AIContext';
import { toast } from 'sonner';
import VoiceCommand from '../../components/VoiceCommand';
import { sanitizeWithFormatting } from '../../utils/sanitize';
import { exportToPdf, exportToDocx, exportToTxt, exportToJson, exportToHtml } from '../../lib/exportUtils';

// Industry-specific templates for quick start
const INDUSTRY_TEMPLATES = {
  'Technology': {
    focus: 'SaaS growth, product launches, developer community',
    commonGoals: ['User acquisition', 'Product adoption', 'Community building', 'API integrations'],
    keyMetrics: ['MRR growth', 'User activation rate', 'NPS score', 'API usage']
  },
  'E-commerce': {
    focus: 'Conversion optimization, customer retention, seasonal campaigns',
    commonGoals: ['Increase sales', 'Reduce cart abandonment', 'Customer lifetime value', 'Brand awareness'],
    keyMetrics: ['Conversion rate', 'AOV', 'Customer retention', 'Traffic growth']
  },
  'Healthcare': {
    focus: 'Patient education, trust building, compliance',
    commonGoals: ['Patient engagement', 'Brand trust', 'Appointment bookings', 'Health education'],
    keyMetrics: ['Patient acquisition', 'Appointment rate', 'Patient satisfaction', 'Content engagement']
  },
  'Finance': {
    focus: 'Trust building, education, regulatory compliance',
    commonGoals: ['Customer acquisition', 'Financial literacy', 'Trust building', 'Product adoption'],
    keyMetrics: ['Sign-up rate', 'Account activation', 'AUM growth', 'Customer satisfaction']
  },
  'Education': {
    focus: 'Student engagement, course enrollment, community building',
    commonGoals: ['Course enrollment', 'Student retention', 'Community growth', 'Brand awareness'],
    keyMetrics: ['Enrollment rate', 'Completion rate', 'Student satisfaction', 'Referral rate']
  },
  'Real Estate': {
    focus: 'Lead generation, property showcasing, agent branding',
    commonGoals: ['Lead generation', 'Property views', 'Agent branding', 'Client engagement'],
    keyMetrics: ['Lead quality', 'View-to-inquiry rate', 'Closing rate', 'Referral rate']
  },
  'Fitness & Wellness': {
    focus: 'Community building, transformation stories, engagement',
    commonGoals: ['Member acquisition', 'Retention', 'Community engagement', 'Program enrollment'],
    keyMetrics: ['Member growth', 'Retention rate', 'Class attendance', 'Social engagement']
  },
  'Food & Beverage': {
    focus: 'Brand storytelling, seasonal promotions, customer loyalty',
    commonGoals: ['Brand awareness', 'Customer loyalty', 'Seasonal sales', 'Social engagement'],
    keyMetrics: ['Foot traffic', 'Repeat visits', 'Social engagement', 'Revenue growth']
  }
};

const STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Name of the strategy' },
    summary: { type: 'string', description: 'Brief summary of the strategy' },
    objectives: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of key objectives'
    },
    targetAudience: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        painPoints: { type: 'array', items: { type: 'string' } },
        goals: { type: 'array', items: { type: 'string' } }
      }
    },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          week: { type: 'number' },
          focus: { type: 'string' },
          tasks: { type: 'array', items: { type: 'string' } },
          successMetrics: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    keyPerformanceIndicators: {
      type: 'object',
      properties: {
        primary: { type: 'string' },
        secondary: { type: 'array', items: { type: 'string' } }
      }
    },
    risksAndMitigations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk: { type: 'string' },
          likelihood: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          impact: { type: 'string', enum: ['Low', 'Medium', 'High'] },
          mitigation: { type: 'string' }
        }
      }
    },
    resources: {
      type: 'object',
      properties: {
        tools: { type: 'array', items: { type: 'string' } },
        team: { type: 'array', items: { type: 'string' } },
        budget: { type: 'string' }
      }
    },
    competitiveAnalysis: {
      type: 'object',
      properties: {
        competitors: { type: 'array', items: { type: 'string' } },
        competitiveAdvantages: { type: 'array', items: { type: 'string' } },
        marketOpportunities: { type: 'array', items: { type: 'string' } },
        differentiationStrategy: { type: 'string' }
      }
    },
    roiProjection: {
      type: 'object',
      properties: {
        estimatedInvestment: { type: 'string' },
        expectedReturn: { type: 'string' },
        roiPercentage: { type: 'string' },
        paybackPeriod: { type: 'string' },
        keyAssumptions: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  required: ['name', 'summary', 'objectives', 'timeline']
};

const NeuralStrategist = () => {
  const { 
    generateStructuredContent, 
    streamContent, 
    isGenerating, 
    updateModelSettings,
    modelSettings 
  } = useAI();
  
  // Refs for export
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  
  const [goal, setGoal] = useState('');
  const [industry, setIndustry] = useState('');
  const [audience, setAudience] = useState('');
  const [timeline, setTimeline] = useState('2 weeks');
  const [strategy, setStrategy] = useState(null);
  const [activeTab, setActiveTab] = useState('strategy');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [showIndustryTemplates, setShowIndustryTemplates] = useState(false);
  const streamContainerRef = useRef(null);

  const generateStrategy = useCallback(async (userGoal = goal, userIndustry = industry, userAudience = audience) => {
    if (!userGoal || !userGoal.trim()) {
      setError('Please enter a goal');
      return;
    }

    setError('');
    setStrategy(null);
    setStreamedText('');
    setIsStreaming(true);

    try {
      // Get industry-specific context if available
      const industryContext = userIndustry && INDUSTRY_TEMPLATES[userIndustry] 
        ? `Industry Context for ${userIndustry}:
        - Focus Areas: ${INDUSTRY_TEMPLATES[userIndustry].focus}
        - Common Goals: ${INDUSTRY_TEMPLATES[userIndustry].commonGoals.join(', ')}
        - Key Metrics: ${INDUSTRY_TEMPLATES[userIndustry].keyMetrics.join(', ')}
        `
        : '';

      // Create a more detailed prompt with competitive analysis and ROI
      const prompt = `Create a detailed, comprehensive business strategy with the following parameters:
      - Goal: ${userGoal}
      - Industry: ${userIndustry || 'Not specified'}
      - Target Audience: ${userAudience || 'General audience'}
      - Timeline: ${timeline}
      
      ${industryContext}
      
      Please generate a comprehensive strategy including:
      1. Clear objectives and summary
      2. Detailed target audience analysis (pain points, goals)
      3. Week-by-week timeline with tasks and success metrics
      4. Key Performance Indicators (primary and secondary)
      5. Risk assessment with likelihood, impact, and mitigation strategies
      6. Required resources (tools, team, budget)
      7. Competitive analysis: identify main competitors, competitive advantages, market opportunities, and differentiation strategy
      8. ROI Projection: estimate investment, expected return, ROI percentage, payback period, and key assumptions
      
      Make this strategy actionable, data-driven, and focused on measurable results.`;

      // First get the structured data
      const structuredData = await generateStructuredContent(
        prompt,
        STRATEGY_SCHEMA,
        {
          model: 'pro',
          temperature: modelSettings.temperature
        }
      );

      setStrategy(structuredData);
      setActiveTab('strategy');
      
      // Generate shareable link (store strategy in sessionStorage with unique ID)
      const strategyId = `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(strategyId, JSON.stringify(structuredData));
      setShareableLink(`${window.location.origin}${window.location.pathname}?strategy=${strategyId}`);
      
      // Then stream a human-readable version
      const streamPrompt = `Convert this JSON strategy into a well-formatted, human-readable markdown document:
      ${JSON.stringify(structuredData, null, 2)}`;
      
      await streamContent(
        streamPrompt,
        (chunk) => {
          setStreamedText(prev => prev + chunk);
          // Auto-scroll to bottom
          if (streamContainerRef.current) {
            streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
          }
        },
        {
          model: 'pro',
          temperature: 0.7,
          maxTokens: 4000
        }
      );
      
    } catch (err) {
      // Log full error details for debugging (only in development)
      if (import.meta.env.DEV) {
        console.error('Error generating strategy:', err);
      }
      // Don't expose technical error details to users
      setError('Failed to generate strategy. Please try again or check your connection.');
      toast.error('Failed to generate strategy. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  }, [goal, industry, audience, timeline, modelSettings.temperature, generateStructuredContent, streamContent]);

  const handleGenerate = () => generateStrategy();
  
  const handleVoiceCommand = async (command) => {
    setVoiceCommand(command);
    
    // Simple command processing - can be enhanced with more sophisticated NLP
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('clear') || lowerCommand.includes('reset')) {
      setGoal('');
      setIndustry('');
      setAudience('');
      toast.success('Form cleared');
      return;
    }
    
    if (lowerCommand.includes('generate') || lowerCommand.includes('create') || lowerCommand.includes('make')) {
      // Extract goal from command
      const goalRegex = /(?:generate|create|make)\s+(?:a\s+|an\s+|the\s+)?strategy\s+(?:for|about|on|to)?\s*["']?(.+?)(?:["']|$|for|about|on|to|with)/i;
      const goalMatch = command.match(goalRegex);
      const extractedGoal = goalMatch && goalMatch[1] ? goalMatch[1].trim() : goal;
      
      // Extract industry if mentioned
      const industryRegex1 = /industry:?\s*([^,.\n]+)/i;
      const industryRegex2 = /in\s+the\s+(\w+)(?:\s+industry)?/i;
      const industryMatch = command.match(industryRegex1) || command.match(industryRegex2);
      const extractedIndustry = industryMatch && industryMatch[1] ? industryMatch[1].trim() : industry;
      
      // Extract audience if mentioned
      const audienceRegex1 = /audience:?\s*([^,.\n]+)/i;
      const audienceRegex2 = /for\s+(?:the\s+)?(?:target\s+)?audience\s+(?:of\s+)?([^,.\n]+)/i;
      const audienceMatch = command.match(audienceRegex1) || command.match(audienceRegex2);
      const extractedAudience = audienceMatch && audienceMatch[1] ? audienceMatch[1].trim() : audience;
      
      // Update state and then generate strategy
      if (goalMatch && goalMatch[1]) {
        setGoal(extractedGoal);
      }
      if (industryMatch && industryMatch[1]) {
        setIndustry(extractedIndustry);
      }
      if (audienceMatch && audienceMatch[1]) {
        setAudience(extractedAudience);
      }
      
      // Use the extracted values directly instead of waiting for state updates
      generateStrategy(extractedGoal, extractedIndustry, extractedAudience);
      
      return;
    }
    
    // Handle other commands
    toast.info('Voice command received: ' + command);
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = strategy ? JSON.stringify(strategy, null, 2) : streamedText;
      if (!textToCopy) {
        toast.error('No content to copy');
        return;
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const copyShareableLink = async () => {
    if (!shareableLink) {
      toast.error('No shareable link available');
      return;
    }
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast.success('Shareable link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy shareable link:', err);
      toast.error('Failed to copy link');
    }
  };

  const applyIndustryTemplate = (industryName) => {
    if (INDUSTRY_TEMPLATES[industryName]) {
      setIndustry(industryName);
      const template = INDUSTRY_TEMPLATES[industryName];
      // Auto-fill goal suggestions based on industry
      if (!goal) {
        setGoal(`Achieve ${template.commonGoals[0].toLowerCase()} in the ${industryName} industry`);
      }
      toast.success(`Applied ${industryName} template`);
      setShowIndustryTemplates(false);
    }
  };
  
  const handleExport = async (format) => {
    if (!strategy) {
      toast.error('No strategy to export');
      return;
    }
    
    setIsExporting(true);
    try {
      const content = (streamedText && streamedText.trim()) || JSON.stringify(strategy, null, 2);
      if (!content || content.trim().length === 0) {
        throw new Error('No content available to export');
      }
      const fileName = `strategy_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'pdf':
          if (!exportRef.current) {
            throw new Error('Export element not found');
          }
          await exportToPdf(exportRef.current, fileName);
          break;
        case 'docx':
          exportToDocx(content, fileName);
          break;
        case 'txt':
          exportToTxt(content, fileName);
          break;
        case 'json':
          exportToJson(strategy, fileName);
          break;
        case 'html':
          exportToHtml(content, fileName);
          break;
        default:
          if (!exportRef.current) {
            throw new Error('Export element not found');
          }
          await exportToPdf(exportRef.current, fileName);
      }
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const renderStrategyTimeline = () => {
    if (!strategy?.timeline) return null;
    
    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-lg font-semibold text-white">Timeline</h3>
        <div className="space-y-8">
          {strategy.timeline.map((week, index) => (
            <div key={index} className="relative pl-8 border-l-2 border-emerald-500/20">
              <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{week?.week || index + 1}</span>
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-emerald-500">{week?.focus || 'No focus specified'}</h4>
                {week.tasks && Array.isArray(week.tasks) && week.tasks.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {week.tasks.map((task, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-emerald-500">•</span>
                        <span className="text-sm">{task}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {week.successMetrics && Array.isArray(week.successMetrics) && week.successMetrics.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h5 className="text-xs font-medium text-slate-400 mb-1">Success Metrics</h5>
                    <ul className="space-y-1">
                      {week.successMetrics.map((metric, i) => (
                        <li key={i} className="text-sm text-slate-300">• {metric}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStrategyDetails = () => {
    if (!strategy) return null;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">Strategy Overview</h3>
          <p className="text-slate-300">{strategy.summary}</p>
        </div>
        
        {strategy.objectives && strategy.objectives.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Key Objectives</h3>
            <ul className="space-y-2">
              {strategy.objectives.map((obj, i) => (
                <li key={i} className="flex items-start text-slate-300">
                  <span className="mr-2 text-emerald-500">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {strategy.targetAudience && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Target Audience</h3>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h4 className="font-medium text-white">{strategy.targetAudience.name || 'Target Audience'}</h4>
              {strategy.targetAudience.description && (
                <p className="text-sm text-slate-400 mt-1">
                  {strategy.targetAudience.description}
                </p>
              )}
              
              {strategy.targetAudience.painPoints && strategy.targetAudience.painPoints.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-slate-200 mb-1">Pain Points</h5>
                  <ul className="space-y-1">
                    {strategy.targetAudience.painPoints.map((point, i) => (
                      <li key={i} className="text-sm text-slate-300">• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {strategy.targetAudience.goals && strategy.targetAudience.goals.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-slate-200 mb-1">Goals</h5>
                  <ul className="space-y-1">
                    {strategy.targetAudience.goals.map((goal, i) => (
                      <li key={i} className="text-sm text-slate-300">• {goal}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {renderStrategyTimeline()}
        
        {strategy.keyPerformanceIndicators && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Key Performance Indicators</h3>
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              {strategy.keyPerformanceIndicators.primary && (
                <>
                  <h4 className="font-medium text-white">Primary KPI</h4>
                  <p className="text-slate-300">
                    {strategy.keyPerformanceIndicators.primary}
                  </p>
                </>
              )}
              
              {strategy.keyPerformanceIndicators.secondary && strategy.keyPerformanceIndicators.secondary.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-slate-200 mb-1">Secondary KPIs</h5>
                  <ul className="space-y-1">
                    {strategy.keyPerformanceIndicators.secondary.map((kpi, i) => (
                      <li key={i} className="text-sm text-slate-300">• {kpi}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {strategy.risksAndMitigations && strategy.risksAndMitigations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Risk Assessment</h3>
            <div className="space-y-3">
              {strategy.risksAndMitigations.map((risk, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-white">{risk.risk}</h4>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        risk.likelihood === 'High' ? 'bg-red-900/50 text-red-300' :
                        risk.likelihood === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-green-900/50 text-green-300'
                      }`}>
                        Likelihood: {risk.likelihood}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        risk.impact === 'High' ? 'bg-red-900/50 text-red-300' :
                        risk.impact === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-green-900/50 text-green-300'
                      }`}>
                        Impact: {risk.impact}
                      </span>
                    </div>
                  </div>
                  {risk.mitigation && (
                    <p className="mt-2 text-sm text-slate-400">
                      <span className="font-medium text-slate-300">Mitigation:</span> {risk.mitigation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {strategy.resources && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-white">Required Resources</h3>
            <div className="space-y-4">
              {strategy.resources.tools && strategy.resources.tools.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-slate-200">Tools & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {strategy.resources.tools.map((tool, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 text-slate-200 text-sm rounded-full border border-slate-700">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {strategy.resources.team && strategy.resources.team.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1 text-slate-200">Team Requirements</h4>
                  <ul className="space-y-1">
                    {strategy.resources.team.map((role, i) => (
                      <li key={i} className="text-sm text-slate-300">• {role}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {strategy.resources.budget && (
                <div>
                  <h4 className="font-medium mb-1 text-slate-200">Estimated Budget</h4>
                  <p className="text-slate-300">{String(strategy.resources.budget)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-shrink-0">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              Neural Strategist
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              AI-powered strategy generation for your goals
            </p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <VoiceCommand 
              onCommand={handleVoiceCommand}
              onTranscript={setVoiceCommand}
              disabled={isGenerating || isStreaming}
            />
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={`flex-shrink-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 ${showSettings ? 'bg-slate-700/70' : ''}`}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || isStreaming}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              {isGenerating || isStreaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">{isStreaming ? 'Streaming...' : 'Generating...'}</span>
                  <span className="sm:hidden">Generating</span>
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Generate Strategy</span>
                  <span className="sm:hidden">Generate</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-6"
          >
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">AI Model Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="model-type" className="text-slate-200">Model</Label>
                      <Select 
                        value={modelSettings.model} 
                        onValueChange={(value) => updateModelSettings({ model: value })}
                      >
                        <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700 text-slate-200">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pro" className="text-slate-200 focus:bg-slate-700">Gemini 1.5 Pro</SelectItem>
                          <SelectItem value="flash" className="text-slate-200 focus:bg-slate-700">Gemini 1.5 Flash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature" className="text-slate-200">Creativity: {modelSettings.temperature.toFixed(1)}</Label>
                      <span className="text-xs text-slate-400">
                        {modelSettings.temperature < 0.3 ? 'Precise' : 
                         modelSettings.temperature < 0.7 ? 'Balanced' : 'Creative'}
                      </span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[modelSettings.temperature]}
                      onValueChange={([value]) => updateModelSettings({ temperature: value })}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Precise</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Strategy Parameters</CardTitle>
                <CardDescription className="text-slate-400">Define your goals and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-slate-200">Your Goal</Label>
                  <Textarea
                    id="goal"
                    placeholder="What do you want to achieve? (e.g., Increase website traffic by 50% in 3 months)"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    rows={3}
                    className="min-h-[100px] bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="industry" className="text-slate-200">Industry</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowIndustryTemplates(!showIndustryTemplates)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 h-auto py-1"
                    >
                      {showIndustryTemplates ? 'Hide' : 'Show'} Templates
                    </Button>
                  </div>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Healthcare, E-commerce"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                  />
                  <AnimatePresence>
                    {showIndustryTemplates && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 bg-slate-900/30 rounded-lg border border-slate-700">
                          <p className="text-xs text-slate-400 mb-2">Industry Templates:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(INDUSTRY_TEMPLATES).map((ind) => (
                              <button
                                key={ind}
                                onClick={() => applyIndustryTemplate(ind)}
                                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                                  industry === ind
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                }`}
                              >
                                {ind}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-slate-200">Target Audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Young professionals, Small business owners, Parents"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-slate-200">Timeline</Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-slate-100">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1 week" className="text-slate-200 focus:bg-slate-700">1 Week</SelectItem>
                      <SelectItem value="2 weeks" className="text-slate-200 focus:bg-slate-700">2 Weeks</SelectItem>
                      <SelectItem value="1 month" className="text-slate-200 focus:bg-slate-700">1 Month</SelectItem>
                      <SelectItem value="3 months" className="text-slate-200 focus:bg-slate-700">3 Months</SelectItem>
                      <SelectItem value="6 months" className="text-slate-200 focus:bg-slate-700">6 Months</SelectItem>
                      <SelectItem value="1 year" className="text-slate-200 focus:bg-slate-700">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {voiceCommand && (
                  <div className="p-3 text-sm bg-slate-800/50 rounded-md border border-slate-700">
                    <p className="font-medium text-slate-200 mb-1">Voice Command:</p>
                    <p className="text-slate-400">"{voiceCommand}"</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md flex items-start border border-red-900/50">
                    <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || isStreaming}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-lg shadow-emerald-500/20"
                  >
                    {isGenerating || isStreaming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isStreaming ? 'Streaming...' : 'Generating...'}
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Strategy
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-slate-400">
                    Or say "Generate strategy for [your goal]"
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {strategy && (
              <Card className="border-slate-700/50 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                    onClick={copyToClipboard}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Export as PDF
                      </>
                    )}
                  </Button>
                  {shareableLink && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                      onClick={copyShareableLink}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Copy Shareable Link
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Strategy',
                          text: streamedText || JSON.stringify(strategy, null, 2),
                          url: shareableLink || window.location.href
                        }).catch(() => {
                          copyToClipboard();
                        });
                      } else {
                        copyToClipboard();
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Strategy
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <div ref={exportRef}>
              <Card className="h-full border-slate-700/50 bg-slate-800/50">
              <CardHeader className="border-b border-slate-700/50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Strategy Output</CardTitle>
                    <CardDescription className="text-slate-400">
                      {strategy 
                        ? 'Your AI-generated strategy' 
                        : 'Your strategy will appear here after generation'}
                    </CardDescription>
                  </div>
                  
                  {strategy && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyToClipboard}
                        disabled={copied}
                        className="hidden sm:flex border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      
                      <Select 
                        value={exportFormat} 
                        onValueChange={setExportFormat}
                        disabled={isExporting}
                      >
                        <SelectTrigger className="w-32 bg-slate-900/50 border-slate-700 text-slate-200">
                          <SelectValue placeholder="Export as" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pdf" className="text-slate-200 focus:bg-slate-700">PDF</SelectItem>
                          <SelectItem value="docx" className="text-slate-200 focus:bg-slate-700">Word</SelectItem>
                          <SelectItem value="txt" className="text-slate-200 focus:bg-slate-700">Text</SelectItem>
                          <SelectItem value="json" className="text-slate-200 focus:bg-slate-700">JSON</SelectItem>
                          <SelectItem value="html" className="text-slate-200 focus:bg-slate-700">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleExport(exportFormat)}
                        disabled={isExporting}
                        className="hidden sm:flex border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                      >
                        {isExporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        Export
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={copyToClipboard}
                        className="sm:hidden border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleExport(exportFormat)}
                        disabled={isExporting}
                        className="sm:hidden border-slate-700 bg-slate-900/50 hover:bg-slate-700/50 text-slate-200"
                        title="Export"
                      >
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {isGenerating || isStreaming ? (
                  <div className="flex flex-col items-center justify-center min-h-[500px] p-6 text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full opacity-75 blur-xl"></div>
                      <div className="relative flex items-center justify-center w-16 h-16 bg-slate-900 rounded-full">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-white">
                      {isStreaming ? 'Streaming your strategy...' : 'Crafting your strategy...'}
                    </h3>
                    
                    <p className="text-slate-400 max-w-md mb-6">
                      {isStreaming 
                        ? 'Our AI is generating a comprehensive strategy for your goals. This may take a moment...'
                        : 'Analyzing your input and generating a tailored strategy...'}
                    </p>
                    
                    {isStreaming && (
                      <div className="w-full max-w-lg space-y-4">
                        <div className="h-2.5 bg-slate-800 rounded-full w-full">
                          <div 
                            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${Math.min(90, 20 + Math.random() * 30)}%` }}
                          ></div>
                        </div>
                        
                        <div className="space-y-2">
                          {['Analyzing goals', 'Researching industry trends', 'Identifying opportunities', 'Creating action plan', 'Optimizing strategy'].map((step, i) => (
                            <div key={i} className="flex items-center text-sm">
                              <div className={`flex-shrink-0 h-2 w-2 rounded-full mr-3 ${
                                i < 2 ? 'bg-emerald-500' : 'bg-slate-700'
                              }`}></div>
                              <span className={`${i < 2 ? 'text-white' : 'text-slate-400'}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : strategy ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="w-full justify-start rounded-none border-b border-slate-700/50 px-6 bg-transparent flex-wrap">
                      <TabsTrigger value="strategy" className="py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">Strategy</TabsTrigger>
                      <TabsTrigger value="executive" className="py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">Executive Summary</TabsTrigger>
                      <TabsTrigger value="timeline" className="py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">Timeline</TabsTrigger>
                      <TabsTrigger value="risks" className="py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">Risks</TabsTrigger>
                      {strategy?.competitiveAnalysis && (
                        <TabsTrigger value="competitors" className="py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          Competitors
                        </TabsTrigger>
                      )}
                      {strategy?.roiProjection && (
                        <TabsTrigger value="roi" className="py-4 text-slate-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          ROI
                        </TabsTrigger>
                      )}
                    </TabsList>
                    
                    <div 
                      ref={streamContainerRef}
                      className="flex-1 overflow-y-auto p-6"
                      style={{ maxHeight: 'calc(100vh - 300px)' }}
                    >
                      <TabsContent value="strategy" className="m-0">
                        <div className="prose dark:prose-invert max-w-none">
                          {streamedText ? (
                            <div dangerouslySetInnerHTML={{ 
                              __html: sanitizeWithFormatting(streamedText)
                            }} 
                            className="whitespace-pre-wrap"
                          />
                          ) : (
                            renderStrategyDetails()
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="executive" className="m-0">
                        <div className="space-y-6">
                          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-xl font-semibold mb-3 text-white">Executive Summary</h3>
                            <p className="text-slate-300">
                              {strategy.summary || 'No summary available.'}
                            </p>
                            
                            {strategy.objectives && strategy.objectives.length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-medium mb-2 text-white">Key Objectives</h4>
                                <ul className="space-y-2">
                                  {strategy.objectives.map((obj, i) => (
                                    <li key={i} className="flex items-start text-slate-300">
                                      <span className="mr-2 text-emerald-500">•</span>
                                      <span>{obj}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {strategy.keyPerformanceIndicators && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {strategy.keyPerformanceIndicators.primary && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                  <h4 className="font-medium text-slate-400 text-sm mb-2">Primary KPI</h4>
                                  <p className="text-lg font-semibold text-white">
                                    {strategy.keyPerformanceIndicators.primary}
                                  </p>
                                </div>
                              )}
                              
                              {strategy.keyPerformanceIndicators.secondary && 
                               strategy.keyPerformanceIndicators.secondary.length > 0 && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                  <h4 className="font-medium text-slate-400 text-sm mb-2">Secondary KPIs</h4>
                                  <ul className="space-y-1">
                                    {strategy.keyPerformanceIndicators.secondary.slice(0, 3).map((kpi, i) => (
                                      <li key={i} className="text-sm text-slate-300">• {kpi}</li>
                                    ))}
                                    {strategy.keyPerformanceIndicators.secondary.length > 3 && (
                                      <li className="text-sm text-slate-500">
                                        +{strategy.keyPerformanceIndicators.secondary.length - 3} more
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="timeline" className="m-0">
                        {renderStrategyTimeline()}
                      </TabsContent>
                      
                      <TabsContent value="risks" className="m-0">
                        {strategy.risksAndMitigations && strategy.risksAndMitigations.length > 0 ? (
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white">Risk Assessment</h3>
                            <div className="space-y-3">
                              {strategy.risksAndMitigations.map((risk, i) => (
                                <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-white">{risk?.risk || 'Unspecified risk'}</h4>
                                    <div className="flex space-x-2">
                                      {risk?.likelihood && (
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                                          risk.likelihood === 'High' ? 'bg-red-900/50 text-red-300' :
                                          risk.likelihood === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                                          'bg-green-900/50 text-green-300'
                                        }`}>
                                          {risk.likelihood} Likelihood
                                        </span>
                                      )}
                                      {risk?.impact && (
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                                          risk.impact === 'High' ? 'bg-red-900/50 text-red-300' :
                                          risk.impact === 'Medium' ? 'bg-yellow-900/50 text-yellow-300' :
                                          'bg-green-900/50 text-green-300'
                                        }`}>
                                          {risk.impact} Impact
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {risk?.mitigation && (
                                    <p className="mt-2 text-sm text-slate-400">
                                      <span className="font-medium text-slate-300">Mitigation:</span> {risk.mitigation}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-slate-400">No risks identified yet.</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      {strategy?.competitiveAnalysis && (
                        <TabsContent value="competitors" className="m-0">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Competitive Analysis
                              </h3>
                              
                              {strategy.competitiveAnalysis.competitors && strategy.competitiveAnalysis.competitors.length > 0 && (
                                <div className="mb-6">
                                  <h4 className="font-medium mb-3 text-slate-200">Main Competitors</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {strategy.competitiveAnalysis.competitors.map((competitor, i) => (
                                      <span key={i} className="px-3 py-1.5 bg-slate-800/50 text-slate-200 text-sm rounded-lg border border-slate-700">
                                        {competitor}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {strategy.competitiveAnalysis.competitiveAdvantages && strategy.competitiveAnalysis.competitiveAdvantages.length > 0 && (
                                <div className="mb-6 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                  <h4 className="font-medium mb-2 text-emerald-400">Competitive Advantages</h4>
                                  <ul className="space-y-2">
                                    {strategy.competitiveAnalysis.competitiveAdvantages.map((advantage, i) => (
                                      <li key={i} className="flex items-start text-slate-300">
                                        <span className="mr-2 text-emerald-500">✓</span>
                                        <span>{advantage}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {strategy.competitiveAnalysis.marketOpportunities && strategy.competitiveAnalysis.marketOpportunities.length > 0 && (
                                <div className="mb-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                                  <h4 className="font-medium mb-2 text-cyan-400">Market Opportunities</h4>
                                  <ul className="space-y-2">
                                    {strategy.competitiveAnalysis.marketOpportunities.map((opportunity, i) => (
                                      <li key={i} className="flex items-start text-slate-300">
                                        <span className="mr-2 text-cyan-500">•</span>
                                        <span>{opportunity}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {strategy.competitiveAnalysis.differentiationStrategy && (
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <h4 className="font-medium mb-2 text-white">Differentiation Strategy</h4>
                                  <p className="text-slate-300">{strategy.competitiveAnalysis.differentiationStrategy}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      )}
                      
                      {strategy?.roiProjection && (
                        <TabsContent value="roi" className="m-0">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                ROI Projection
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {strategy.roiProjection.estimatedInvestment && (
                                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <h4 className="font-medium text-slate-400 text-sm mb-2">Estimated Investment</h4>
                                    <p className="text-2xl font-bold text-white">{strategy.roiProjection.estimatedInvestment}</p>
                                  </div>
                                )}
                                
                                {strategy.roiProjection.expectedReturn && (
                                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <h4 className="font-medium text-slate-400 text-sm mb-2">Expected Return</h4>
                                    <p className="text-2xl font-bold text-emerald-400">{strategy.roiProjection.expectedReturn}</p>
                                  </div>
                                )}
                                
                                {strategy.roiProjection.roiPercentage && (
                                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <h4 className="font-medium text-emerald-400 text-sm mb-2">ROI Percentage</h4>
                                    <p className="text-2xl font-bold text-emerald-300">{strategy.roiProjection.roiPercentage}</p>
                                  </div>
                                )}
                                
                                {strategy.roiProjection.paybackPeriod && (
                                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <h4 className="font-medium text-slate-400 text-sm mb-2">Payback Period</h4>
                                    <p className="text-2xl font-bold text-white">{strategy.roiProjection.paybackPeriod}</p>
                                  </div>
                                )}
                              </div>
                              
                              {strategy.roiProjection.keyAssumptions && strategy.roiProjection.keyAssumptions.length > 0 && (
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <h4 className="font-medium mb-3 text-white">Key Assumptions</h4>
                                  <ul className="space-y-2">
                                    {strategy.roiProjection.keyAssumptions.map((assumption, i) => (
                                      <li key={i} className="flex items-start text-slate-300">
                                        <span className="mr-2 text-slate-400">•</span>
                                        <span>{assumption}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      )}
                    </div>
                  </Tabs>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/30">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                      <Sparkles className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Strategy Generated</h3>
                    <p className="text-slate-400 max-w-md">
                      Fill out the form to generate a customized content strategy powered by AI.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralStrategist;
