import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Lightbulb, 
  Loader2, 
  RefreshCw, 
  Copy, 
  Check,
  AlertCircle,
  Sparkles,
  Plus 
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { useToast } from '../../components/ui/use-toast';

const IdeaGenerator = () => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('All Types');
  const [result, setResult] = useState('');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const contentTypes = [
    'All Types',
    'Blog Posts',
    'Social Media Posts',
    'Video Content',
    'Email Campaigns',
    'Podcast Episodes',
    'Infographics'
  ];

  const handleGenerate = async (isRegenerate = false) => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    if (!isRegenerate) {
      setResult('');
      setIdeas([]);
    }

    try {
      const typeFilter = contentType === 'All Types' 
        ? 'across different content formats' 
        : `specifically for ${contentType}`;

      const prompt = `Generate 10 creative, unique, and actionable content ideas about "${topic}" ${typeFilter}.
      
      For each idea, provide:
      1. A catchy title
      2. A brief description (2-3 sentences)
      3. Target audience
      4. Key takeaway or value proposition
      5. Suggested content format
      
      Make the ideas diverse, engaging, and practical to implement. Focus on originality and audience value.`;

      const response = await aiAPI.generate(prompt, {
        model: 'pro',
        temperature: 0.8,
        maxTokens: 3096,
      });

      setResult(response);
      
      // Extract ideas (simplified parsing)
      const ideaList = response.split(/\n\n+/).filter(item => 
        item.trim().length > 50 && 
        (item.includes('Title:') || item.includes('Idea') || /^\d+\./.test(item.trim()))
      );
      setIdeas(ideaList);

      toast({
        title: 'Success',
        description: `${ideaList.length || 10} content ideas generated!`,
      });
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError('Failed to generate content ideas. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to generate content ideas. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'All ideas copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyIdea = (idea) => {
    navigator.clipboard.writeText(idea);
    toast({
      title: 'Copied!',
      description: 'Idea copied to clipboard',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              Idea Generator
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate unlimited creative content ideas powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-emerald-500" />
                  Idea Parameters
                </CardTitle>
                <CardDescription>
                  Configure your content idea generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Niche</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., artificial intelligence, sustainable living"
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <select
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {contentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md flex items-start">
                    <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  onClick={() => handleGenerate(false)} 
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Ideas
                    </>
                  )}
                </Button>

                {result && (
                  <Button 
                    onClick={() => handleGenerate(true)} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate More Ideas
                  </Button>
                )}

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Example Topics:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Digital Marketing', 'Mental Health', 'Tech Innovation', 'Remote Work'].map((example) => (
                      <button
                        key={example}
                        onClick={() => setTopic(example)}
                        className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-emerald-500" />
                    Content Ideas
                  </CardTitle>
                  {result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
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
                          Copy All
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <CardDescription>
                  AI-generated creative content ideas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-75 blur-xl"></div>
                      <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full p-3">
                        <Lightbulb className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      Generating creative ideas...
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      Brainstorming unique content concepts
                    </p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {ideas.length > 0 ? (
                      <div className="grid gap-4">
                        {ideas.map((idea, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                      {idea}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyIdea(idea)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div 
                        className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm whitespace-pre-wrap overflow-y-auto"
                        style={{ 
                          lineHeight: '1.8',
                          maxHeight: 'calc(100vh - 300px)'
                        }}
                      >
                        {result}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                      <Lightbulb className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No Ideas Generated Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
                      Enter a topic and click "Generate Ideas" to get 10 creative content ideas
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                      {[
                        { icon: '🎯', title: 'Targeted', desc: 'Ideas tailored to your niche' },
                        { icon: '✨', title: 'Creative', desc: 'Unique and engaging concepts' },
                        { icon: '⚡', title: 'Actionable', desc: 'Ready to implement' }
                      ].map((feature, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                          <div className="text-2xl mb-2">{feature.icon}</div>
                          <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {feature.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IdeaGenerator;

