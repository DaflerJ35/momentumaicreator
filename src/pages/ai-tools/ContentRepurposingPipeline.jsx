import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  RefreshCw, 
  Copy, 
  Download, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  FileText,
  Video,
  Image as ImageIcon,
  Mic,
  Mail,
  Hash,
  ArrowRight,
  Play
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';

const ContentRepurposingPipeline = () => {
  const [sourceContent, setSourceContent] = useState('');
  const [sourceType, setSourceType] = useState('blog');
  const [targetPlatforms, setTargetPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repurposedContent, setRepurposedContent] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const sourceTypes = [
    { value: 'blog', label: 'Blog Post', icon: FileText },
    { value: 'video', label: 'Video Script', icon: Video },
    { value: 'podcast', label: 'Podcast Transcript', icon: Mic },
    { value: 'social', label: 'Social Media Post', icon: Hash },
    { value: 'email', label: 'Email Newsletter', icon: Mail },
  ];

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Hash },
    { id: 'twitter', name: 'Twitter/X', icon: Hash },
    { id: 'linkedin', name: 'LinkedIn', icon: Hash },
    { id: 'facebook', name: 'Facebook', icon: Hash },
    { id: 'tiktok', name: 'TikTok', icon: Video },
    { id: 'youtube', name: 'YouTube', icon: Video },
    { id: 'pinterest', name: 'Pinterest', icon: ImageIcon },
    { id: 'email', name: 'Email Newsletter', icon: Mail },
  ];

  const togglePlatform = (platformId) => {
    setTargetPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleRepurpose = async () => {
    if (!sourceContent.trim()) {
      toast.error('Please enter source content');
      return;
    }

    if (targetPlatforms.length === 0) {
      toast.error('Please select at least one target platform');
      return;
    }

    setLoading(true);
    setRepurposedContent({});
    setCurrentStep(0);

    try {
      const results = {};
      
      for (let i = 0; i < targetPlatforms.length; i++) {
        const platformId = targetPlatforms[i];
        const platform = platforms.find(p => p.id === platformId);
        setCurrentStep(i + 1);

        const prompt = `Repurpose this ${sourceType} content for ${platform.name} platform.

Source Content:
${sourceContent}

Transform this content into a ${platform.name} post that:
1. Matches ${platform.name}'s format and style
2. Optimizes for ${platform.name}'s audience
3. Maintains the core message and value
4. Includes appropriate formatting, hashtags, and calls-to-action
5. Follows ${platform.name}'s best practices

Provide the repurposed content in JSON format:
{
  "content": "the main repurposed content",
  "caption": "optimized caption/text",
  "hashtags": ["hashtag1", "hashtag2"],
  "format": "post/story/reel/carousel/etc",
  "optimalLength": "character count guidance",
  "bestTimeToPost": "recommended posting time",
  "cta": "call to action suggestion",
  "visualSuggestions": "suggestions for accompanying visuals"
}`;

        const schema = {
          type: 'object',
          properties: {
            content: { type: 'string' },
            caption: { type: 'string' },
            hashtags: { type: 'array', items: { type: 'string' } },
            format: { type: 'string' },
            optimalLength: { type: 'string' },
            bestTimeToPost: { type: 'string' },
            cta: { type: 'string' },
            visualSuggestions: { type: 'string' }
          },
          required: ['content', 'caption']
        };

        const result = await aiAPI.generateStructured(prompt, schema, {
          model: 'pro',
          temperature: 0.7,
          maxTokens: 2048,
        });

        results[platformId] = result;
        setRepurposedContent({ ...results });
      }

      toast.success(`Successfully repurposed content for ${targetPlatforms.length} platform(s)!`);
      setCurrentStep(0);
    } catch (error) {
      console.error('Repurposing error:', error);
      toast.error(error.message || 'Failed to repurpose content. Please try again.');
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const exportAll = () => {
    const exportData = {
      sourceContent,
      sourceType,
      repurposedContent,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repurposed-content-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Content exported!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-500/30">
            <RefreshCw className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Content Repurposing Pipeline</h1>
            <p className="text-slate-400 mt-1">Transform one piece of content into multiple platform formats</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-700/50 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Source Content</CardTitle>
              <CardDescription>Enter your original content to repurpose</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sourceType" className="text-slate-300">Source Content Type</Label>
                <select
                  id="sourceType"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {sourceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sourceContent" className="text-slate-300">Content</Label>
                <Textarea
                  id="sourceContent"
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  placeholder="Paste your blog post, video script, podcast transcript, or any content here..."
                  className="mt-2 min-h-[300px] bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card className="border-slate-700/50 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Target Platforms</CardTitle>
              <CardDescription>Select platforms to repurpose content for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = targetPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/20'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-2 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {platform.name}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleRepurpose}
            disabled={loading || !sourceContent.trim() || targetPlatforms.length === 0}
            className="w-full btn-premium"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Repurposing for {targetPlatforms[currentStep - 1] || 'platforms'}... ({currentStep}/{targetPlatforms.length})
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Repurpose Content
              </>
            )}
          </Button>

          {Object.keys(repurposedContent).length > 0 && (
            <Button
              onClick={exportAll}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Content
            </Button>
          )}
        </div>

        {/* Progress & Results Preview */}
        <div className="space-y-6">
          <Card className="border-slate-700/50 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Repurposing Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 animate-spin" />
                    <p className="text-slate-300 text-sm">
                      Repurposing for {targetPlatforms[currentStep - 1] || 'platforms'}...
                    </p>
                  </div>
                  <div className="space-y-2">
                    {targetPlatforms.map((platformId, index) => {
                      const platform = platforms.find(p => p.id === platformId);
                      const isComplete = index < currentStep - 1;
                      const isCurrent = index === currentStep - 1;
                      return (
                        <div
                          key={platformId}
                          className={`flex items-center gap-2 p-2 rounded ${
                            isComplete ? 'bg-emerald-500/20' : isCurrent ? 'bg-blue-500/20' : 'bg-slate-700/30'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-slate-600" />
                          )}
                          <span className="text-sm text-slate-300">{platform?.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : Object.keys(repurposedContent).length > 0 ? (
                <div className="space-y-2">
                  {Object.keys(repurposedContent).map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return (
                      <div
                        key={platformId}
                        className="flex items-center gap-2 p-2 rounded bg-emerald-500/20"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-slate-300">{platform?.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm">
                    Select platforms and click "Repurpose Content" to start
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Repurposed Content Results */}
      {Object.keys(repurposedContent).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          {Object.entries(repurposedContent).map(([platformId, content]) => {
            const platform = platforms.find(p => p.id === platformId);
            const Icon = platform?.icon || Hash;
            return (
              <Card key={platformId} className="border-slate-700/50 bg-slate-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{platform?.name} Content</CardTitle>
                        <CardDescription>
                          {content.format && `Format: ${content.format}`}
                          {content.optimalLength && ` • ${content.optimalLength}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(content.content || content.caption)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-sm mb-2 block">Content</Label>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-slate-300 whitespace-pre-wrap">{content.content || content.caption}</p>
                    </div>
                  </div>

                  {content.hashtags && content.hashtags.length > 0 && (
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 block">Hashtags</Label>
                      <div className="flex flex-wrap gap-2">
                        {content.hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300"
                          >
                            #{tag.replace('#', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.cta && (
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 block">Call to Action</Label>
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                        <p className="text-emerald-400">{content.cta}</p>
                      </div>
                    </div>
                  )}

                  {content.bestTimeToPost && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Sparkles className="h-4 w-4" />
                      <span>Best time to post: {content.bestTimeToPost}</span>
                    </div>
                  )}

                  {content.visualSuggestions && (
                    <div>
                      <Label className="text-slate-400 text-sm mb-2 block">Visual Suggestions</Label>
                      <p className="text-slate-300 text-sm">{content.visualSuggestions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default ContentRepurposingPipeline;

