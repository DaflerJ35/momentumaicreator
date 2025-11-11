import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  SelectGroup 
} from '../../components/ui/select';
import { 
  Check, 
  Copy, 
  Download, 
  Loader2, 
  Sparkles, 
  Volume2, 
  Wand2, 
  Lightbulb, 
  History, 
  Zap, 
  Clock, 
  Share2,
  ChevronDown,
  ChevronUp,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { useAI } from '../../lib/ai';
import { useAuth } from '../../contexts/AuthContext';
import VoiceCommand from '../../components/VoiceCommand';
import { saveAs } from 'file-saver';
import { exportToPdf, exportToDocx, exportToTxt, exportToJson, exportToHtml } from '../../lib/exportUtils';
import { sanitizeWithFormatting } from '../../utils/sanitize';
import { debounce, throttle } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { PLATFORMS } from '../../lib/platforms';

// Content templates for different use cases
const contentTemplates = {
  marketing: {
    name: 'Marketing Post',
    template: (brand = 'your brand') => 
      `Introducing our latest innovation from ${brand} - designed to solve your biggest challenges. ` +
      `With cutting-edge technology and user-focused design, we're setting new standards. ` +
      `Join thousands of satisfied customers who are already experiencing the difference.`
  },
  announcement: {
    name: 'Product Announcement',
    template: (product = 'our product') => 
      `🚀 Big news! We're thrilled to announce ${product} is now live! ` +
      `After months of development and testing, we're excited to bring you this game-changing solution. ` +
      `Check it out now and be among the first to experience the future!`
  },
  educational: {
    name: 'Educational Content',
    template: (topic = 'this topic') => 
      `Did you know? ${topic} is more important than you might think. ` +
      `In this post, we'll explore the key concepts, benefits, and practical applications. ` +
      `Swipe through to learn more and don't forget to save this for later!`
  },
  testimonial: {
    name: 'Customer Testimonial',
    template: (product = 'our product') => 
      `"I was skeptical at first, but ${product} completely transformed my workflow. ` +
      `The results speak for themselves - increased productivity, better outcomes, and a significant ROI. ` +
      `Highly recommend giving it a try!" - Happy Customer`
  },
  event: {
    name: 'Event Announcement',
    template: (event = 'our event') => 
      `🎉 Save the date! ${event} is coming soon. ` +
      `Join industry leaders and like-minded professionals for a day of learning, networking, and inspiration. ` +
      `Early bird tickets are now available - don't miss out!`
  }
};

// Convert PLATFORMS to NeuralMultiplier format - ALL platforms including OnlyFans, Fansly, etc.
const platforms = Object.values(PLATFORMS).map(platform => ({
  id: platform.id,
  name: platform.name,
  maxLength: platform.maxPostLength || 5000,
  icon: platform.icon,
  category: platform.category,
}));

const toneOptions = [
  'Professional', 'Casual', 'Friendly', 'Authoritative', 'Humorous',
  'Inspirational', 'Urgent', 'Educational', 'Conversational', 'Persuasive'
];

// Enhanced content transformation presets - MOVED OUTSIDE COMPONENT to fix reference error
const getPlatformPresets = (userName = 'Your Name') => ({
  twitter: {
    format: (text) => `🚀 ${text.slice(0, 275)}${text.length > 275 ? '...' : ''}`,
    maxLength: 280
  },
  instagram: {
    format: (text) => `✨ ${text}\n\n#content #socialmedia #engagement`,
    maxLength: 2200
  },
  linkedin: {
    format: (text) => `💼 Professional Post\n\n${text}\n\n#networking #career #business`,
    maxLength: 3000
  },
  tiktok: {
    format: (text) => `🎵 ${text.slice(0, 145)}\n\n#fyp #viral #trending`,
    maxLength: 150
  },
  youtube: {
    format: (text) => `🎥 ${text}\n\nDon't forget to like and subscribe for more content!`,
    maxLength: 5000
  },
  blog: {
    format: (text) => `# ${text.split('.')[0]}\n\n${text}\n\n---\n*Generated with Momentum AI*`,
    maxLength: 10000
  },
  email: {
    format: (text) => `Subject: ${text.split('.')[0]}\n\nHi there,\n\n${text}\n\nBest regards,\n${userName}`,
    maxLength: 5000
  },
  threads: {
    format: (text) => `🧵 ${text.slice(0, 250)}${text.length > 250 ? '...' : ''}`,
    maxLength: 500
  },
  // Subscription platforms - generic format
  onlyfans: {
    format: (text) => text,
    maxLength: 10000
  },
  fansly: {
    format: (text) => text,
    maxLength: 10000
  },
  fanvue: {
    format: (text) => text,
    maxLength: 10000
  },
  fanplace: {
    format: (text) => text,
    maxLength: 10000
  }
});

const NeuralMultiplier = () => {
  // State management
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin']);
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({});
  const [activeTab, setActiveTab] = useState('twitter');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [characterCount, setCharacterCount] = useState(0);
  const [contentHistory, setContentHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  
  // Refs
  const exportRef = useRef(null);
  const contentRef = useRef(null);
  const suggestionsEndRef = useRef(null);
  
  // Hooks
  const { toast } = useToast();
  const { generateContent } = useAI();
  const { currentUser } = useAuth();
  
  // Memoized values
  const platformOptions = useMemo(() => 
    platforms.map(platform => ({
      ...platform,
      selected: selectedPlatforms.includes(platform.id)
    })), 
    [selectedPlatforms]
  );
  
  const activePlatform = useMemo(
    () => platforms.find(p => p.id === activeTab) || {},
    [activeTab]
  );
  
  
  // Throttled content update for performance
  const updateContent = useMemo(
    () =>
      throttle((value) => {
        setContent(value);
        setCharacterCount(value.length);
      }, 300),
    []
  );
  
  // Clean up throttle on unmount
  useEffect(() => {
    return () => {
      updateContent.cancel?.();
    };
  }, [updateContent]);
  
  // Transform content with AI and apply platform-specific formatting
  const transformContent = useCallback(async (text, platformId, platformName, tone) => {
    if (!text.trim()) return '';
    
    try {
      // Get platform presets with current user name
      const platformPresets = getPlatformPresets(currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Your Name');
      
      // Use platformId directly (already lowercase like 'twitter', 'instagram')
      const platformKey = platformId.toLowerCase();
      
      const enhancedContent = await generateContent({
        prompt: `Transform this content for ${platformName} with a ${tone} tone. Focus on making it engaging and platform-appropriate.\n\nContent: "${text}"`,
        maxTokens: platformPresets[platformKey]?.maxLength || 500,
        temperature: 0.7,
      });

      // Apply platform-specific formatting
      return platformPresets[platformKey]?.format(enhancedContent) || enhancedContent;
    } catch (error) {
      console.error('Error transforming content:', error);
      throw error;
    }
  }, [generateContent, currentUser]);

  // Generate suggestions function - memoized to prevent recreation on every render
  const generateSuggestions = useCallback(async (text) => {
    if (!text.trim() || isSuggesting) return [];
    
    setIsSuggesting(true);
    try {
      const prompt = `Generate 3 different variations or improvements for this content. Each should be concise and focus on a different angle. Content: "${text}"`;
      const response = await generateContent({
        prompt,
        maxTokens: 150,
        temperature: 0.8,
      });
      
      // Parse the response into an array of suggestions
      const suggestions = response
        .split('\n')
        .filter(line => line.trim().length > 0 && !line.toLowerCase().includes('suggestion'))
        .map(line => line.replace(/^\d+[.)\s]*/, '').trim())
        .slice(0, 3);
      
      setSuggestions(suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate suggestions. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsSuggesting(false);
    }
  }, [generateContent, isSuggesting, toast]);
  
  // Apply a suggestion to the content
  const applySuggestion = useCallback((suggestion) => {
    setContent(suggestion);
    setSuggestions([]);
  }, []);

  // Handle copy to clipboard
  const handleCopy = useCallback(async (textToCopy = null) => {
    const text = textToCopy || generatedContent[activeTab];
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  }, [generatedContent, activeTab, toast]);

  // Handle generate content for all selected platforms
  const handleGenerate = useCallback(async () => {
    if (!content.trim() || selectedPlatforms.length === 0 || isGenerating) return;
    
    // Require authentication
    if (!currentUser) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use Neural Multiplier',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent({});
    
    try {
      const results = {};
      
      // Generate content for each selected platform
      for (const platformId of selectedPlatforms) {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform) continue;
        
        try {
          // Use platform.id for preset lookup (e.g., 'twitter', 'instagram') and platform.name for display
          const transformed = await transformContent(content, platform.id, platform.name, tone);
          results[platformId] = transformed;
        } catch (error) {
          console.error(`Error generating for ${platform.name}:`, error);
          results[platformId] = `Error generating content for ${platform.name}. Please try again.`;
        }
      }
      
      setGeneratedContent(results);
      
      // Set active tab to first platform
      if (selectedPlatforms.length > 0) {
        setActiveTab(selectedPlatforms[0]);
      }
      
      // Save to history
      const historyItem = {
        id: uuidv4(),
        content,
        generatedContent: results,
        platforms: selectedPlatforms,
        tone,
        timestamp: new Date().toISOString(),
      };
      setContentHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50
      
      toast({
        title: 'Success!',
        description: `Generated content for ${selectedPlatforms.length} platform(s)`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [content, selectedPlatforms, tone, isGenerating, currentUser, transformContent, toast]);
  
  // Apply a template to the content
  const applyTemplate = useCallback((templateKey) => {
    const template = contentTemplates[templateKey];
    if (!template) return;
    
    setSelectedTemplate(templateKey);
    
    // If template requires variables, show input dialog
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;
    
    while ((match = variableRegex.exec(template.template())) !== null) {
      const varName = match[1].trim();
      if (!variables.includes(varName)) {
        variables.push(varName);
      }
    }
    
    if (variables.length > 0) {
      // Show modal for variables
      const newVars = {};
      variables.forEach(v => {
        newVars[v] = templateVariables[v] || '';
      });
      setTemplateVariables(newVars);
    } else {
      // Apply template directly
      setContent(template.template());
    }
  }, [templateVariables]);
  
  // Handle template variable changes
  const handleTemplateVariableChange = (varName, value) => {
    setTemplateVariables(prev => ({
      ...prev,
      [varName]: value
    }));
  };
  
  // Apply template with variables
  const applyTemplateWithVariables = useCallback(() => {
    if (!selectedTemplate) return;
    
    let result = contentTemplates[selectedTemplate].template();
    Object.entries(templateVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}}`, 'g'), value);
    });
    
    setContent(result);
    setSelectedTemplate(null);
    setTemplateVariables({});
  }, [selectedTemplate, templateVariables]);
  
  const handleExport = useCallback(async (format = exportFormat) => {
    if (!generatedContent[activeTab]) return;
    
    setIsExporting(true);
    try {
      const content = generatedContent[activeTab];
      const platformName = platforms.find(p => p.id === activeTab)?.name || 'Content';
      const fileName = `MomentumAI_${platformName}_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'pdf':
          await exportToPdf(exportRef.current, fileName);
          break;
        case 'docx':
          await exportToDocx(content, fileName);
          break;
        case 'txt':
          exportToTxt(content, fileName);
          break;
        case 'json':
          exportToJson({ [activeTab]: content, platform: activeTab, timestamp: new Date().toISOString() }, fileName);
          break;
        case 'html':
          exportToHtml(content, fileName);
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      toast({
        title: 'Success',
        description: `Content exported as ${format.toUpperCase()}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: `Could not export content as ${format.toUpperCase()}. ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, exportFormat, generatedContent, toast]);
  
  // Handle voice command processing
  const handleVoiceCommand = useCallback((command) => {
    const cmd = command.toLowerCase();
    try {
      if (cmd.includes('generate') || cmd.includes('create')) {
        handleGenerate();
        return 'Generating content...';
      } else if (cmd.includes('copy') || cmd.includes('copy to clipboard')) {
        if (generatedContent[activeTab]) {
          handleCopy();
          return 'Content copied to clipboard';
        }
      } else if (cmd.includes('export') || cmd.includes('download')) {
        const formatMatch = cmd.match(/(pdf|docx|txt|json|html)/);
        const format = formatMatch ? formatMatch[1] : exportFormat;
        handleExport(format);
        return `Exporting as ${format.toUpperCase()}...`;
      } else if (cmd.includes('clear') || cmd.includes('reset')) {
        setContent('');
        setGeneratedContent({});
        return 'Content cleared';
      } else if (cmd.includes('help')) {
        return 'You can say: generate content, copy to clipboard, export as PDF/DOCX/TXT/JSON/HTML, clear content';
      }
      return 'Command not recognized. Try saying "help" for available commands.';
    } catch (error) {
      console.error('Voice command error:', error);
      return 'Sorry, I encountered an error processing your command.';
    }
  }, [handleGenerate, handleCopy, handleExport, generatedContent, activeTab, exportFormat]);

  // Render template variables input modal
  const renderTemplateVariablesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Customize Template</h3>
          <button 
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateVariables({});
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {Object.keys(templateVariables).map((varName) => (
            <div key={varName}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {varName.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="text"
                value={templateVariables[varName]}
                onChange={(e) => handleTemplateVariableChange(varName, e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder={`Enter ${varName}`}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedTemplate(null);
              setTemplateVariables({});
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={applyTemplateWithVariables}
            disabled={Object.values(templateVariables).some(v => !v.trim())}
          >
            Apply Template
          </Button>
        </div>
      </div>
    </div>
  );

  // Render AI suggestions
  const renderSuggestions = () => (
    <div className="mt-4 space-y-2">
      <div className="flex items-center text-sm text-muted-foreground">
        <Lightbulb className="w-4 h-4 mr-2" />
        <span>AI Suggestions</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="p-3 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-colors"
            onClick={() => applySuggestion(suggestion)}
          >
            <p className="text-sm">{suggestion}</p>
          </div>
        ))}
        {isSuggesting && (
          <div className="flex items-center justify-center p-3">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Generating suggestions...</span>
          </div>
        )}
      </div>
    </div>
  );

  // Render platform tabs
  const renderPlatformTabs = () => (
    <div className="flex space-x-1 p-1 bg-muted rounded-lg mb-6 overflow-x-auto">
      {selectedPlatforms.map((platformId) => {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform) return null;
        
        return (
          <button
            key={platformId}
            onClick={() => setActiveTab(platformId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === platformId
                ? 'bg-white dark:bg-gray-800 shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {platform.name}
          </button>
        );
      })}
    </div>
  );

  // Render content area with tabs
  const renderContentArea = () => (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Generated Content</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!generatedContent[activeTab]}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Select 
              value={exportFormat} 
              onValueChange={setExportFormat}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Export as" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">Word</SelectItem>
                <SelectItem value="txt">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!generatedContent[activeTab] || isExporting}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderPlatformTabs()}
        <div 
          ref={exportRef}
          className="prose dark:prose-invert max-w-none p-4 border rounded-md bg-card min-h-[200px]"
        >
          {generatedContent[activeTab] ? (
            <div dangerouslySetInnerHTML={{ 
              __html: sanitizeWithFormatting(generatedContent[activeTab])
            }} />
          ) : (
            <p className="text-muted-foreground">
              {isGenerating 
                ? 'Generating content...' 
                : 'Your generated content will appear here. Select platforms and click "Generate" to get started.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render template selector
  const renderTemplateSelector = () => (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer py-2"
        onClick={() => setShowTemplates(!showTemplates)}
      >
        <h3 className="font-medium flex items-center">
          <Wand2 className="w-4 h-4 mr-2" />
          Content Templates
        </h3>
        {showTemplates ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
      
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {Object.entries(contentTemplates).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="p-4 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium mb-1">{template.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.template().substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render collaboration panel
  const renderCollaborationPanel = () => (
    <div className="mt-6 border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <Share2 className="w-4 h-4 mr-2" />
          Collaboration
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollaborating(!isCollaborating)}
        >
          {isCollaborating ? 'Stop Collaborating' : 'Start Collaborating'}
        </Button>
      </div>
      
      {isCollaborating && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="email"
              value={collaboratorEmail}
              onChange={(e) => setCollaboratorEmail(e.target.value)}
              placeholder="Enter collaborator's email"
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Button 
              size="sm"
              onClick={() => {
                if (collaboratorEmail && !collaborators.includes(collaboratorEmail)) {
                  setCollaborators([...collaborators, collaboratorEmail]);
                  setCollaboratorEmail('');
                }
              }}
              disabled={!collaboratorEmail.includes('@')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Collaborators:</h4>
              <div className="space-y-2">
                {collaborators.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <span className="text-sm">{email}</span>
                    <button
                      onClick={() => {
                        setCollaborators(collaborators.filter((_, i) => i !== index));
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Require authentication to use Neural Multiplier
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-4">
            Authentication Required
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please sign in to use Neural Multiplier. All features require authentication.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth/signin?redirect=/ai-tools/neural-multiplier'}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              Neural Multiplier
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Transform your content into platform-optimized variations
            </p>
          </div>
          
          <VoiceCommand onCommand={handleVoiceCommand} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Content Input</CardTitle>
                <CardDescription>
                  Enter your content and select target platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="content">Your Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => {
                        const value = e.target.value;
                        setContent(value);
                        setCharacterCount(value.length);
                      }}
                      placeholder="Paste or type your content here..."
                      className="min-h-[200px] mt-2"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      {content.length} characters
                    </p>
                  </div>

                  <div>
                    <Label>Target Platforms</Label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                      {platforms.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatforms.includes(platform.id);
                        return (
                          <label
                            key={platform.id}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                              isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPlatforms([...selectedPlatforms, platform.id]);
                                } else {
                                  if (selectedPlatforms.length > 1) {
                                    setSelectedPlatforms(selectedPlatforms.filter(id => id !== platform.id));
                                  } else {
                                    toast({
                                      title: 'At least one platform required',
                                      description: 'Please select at least one platform',
                                      variant: 'destructive',
                                    });
                                  }
                                }
                              }}
                              disabled={isSelected && selectedPlatforms.length === 1}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            {Icon && <Icon className="h-4 w-4 text-slate-500" />}
                            <span className="text-sm flex-1">{platform.name}</span>
                            <span className="text-xs text-slate-400">{platform.maxLength} chars</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>

                  <div>
                    <Label>Tone</Label>
                    <Select 
                      value={tone} 
                      onValueChange={setTone}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        {toneOptions.map((toneOption) => (
                          <SelectItem key={toneOption} value={toneOption}>
                            {toneOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !content.trim() || selectedPlatforms.length === 0}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Variations
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Output */}
          <div className="lg:col-span-2">
            <div ref={exportRef}>
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Generated Content</CardTitle>
                      <CardDescription>
                        {Object.keys(generatedContent).length > 0 
                          ? 'Your AI-generated content variations' 
                          : 'Your content variations will appear here'}
                      </CardDescription>
                    </div>
                    
                    {Object.keys(generatedContent).length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopy(generatedContent[activeTab])}
                          disabled={!generatedContent[activeTab]}
                        >
                          {copied ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4" />
                          )}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        
                        <Select 
                          value={exportFormat} 
                          onValueChange={setExportFormat}
                          disabled={isExporting}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Export as" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="docx">Word</SelectItem>
                            <SelectItem value="txt">Text</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleExport(exportFormat)}
                          disabled={isExporting || !generatedContent[activeTab]}
                        >
                          {isExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-75 blur-xl"></div>
                        <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full p-3">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">Generating Content</h3>
                      <p className="text-slate-400 max-w-md">
                        Our AI is crafting platform-optimized variations of your content...
                      </p>
                      <div className="w-full max-w-md mt-6">
                        <div className="h-2.5 bg-slate-700 rounded-full w-full overflow-hidden">
                          <div 
                            className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                            style={{ 
                              width: `${Math.min(90, 20 + Math.random() * 30)}%`,
                              transition: 'width 0.5s ease-in-out'
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          <span>Analyzing content</span>
                          <span>Optimizing for {selectedPlatforms.length} platforms</span>
                        </div>
                      </div>
                    </div>
                  ) : Object.keys(generatedContent).length > 0 ? (
                    <div className="h-full flex flex-col">
                      <div className="border-b border-slate-200 dark:border-slate-700">
                        <div className="flex overflow-x-auto">
                          {selectedPlatforms.map((platformId) => {
                            const platform = platforms.find(p => p.id === platformId);
                            return (
                              <button
                                key={platformId}
                                onClick={() => setActiveTab(platformId)}
                                className={`px-6 py-4 text-sm font-medium transition-colors ${
                                  activeTab === platformId
                                    ? 'border-b-2 border-emerald-500 text-emerald-500'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                }`}
                              >
                                {platform?.name || platformId}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6">
                        {activeTab && generatedContent[activeTab] ? (
                          <div className="prose dark:prose-invert max-w-none">
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: sanitizeWithFormatting(generatedContent[activeTab])
                              }} 
                              className="whitespace-pre-wrap"
                            />
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {generatedContent[activeTab].length} characters
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => {
                                      const utterance = new SpeechSynthesisUtterance(generatedContent[activeTab]);
                                      window.speechSynthesis.speak(utterance);
                                    }}
                                  >
                                    <Volume2 className="h-4 w-4 mr-2" />
                                    Listen
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <p className="text-slate-500 dark:text-slate-400">
                              No content generated for this platform yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                      <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">No Content Generated</h3>
                      <p className="text-slate-400 max-w-md">
                        Enter your content and click "Generate Variations" to create platform-optimized versions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuralMultiplier;
