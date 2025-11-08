import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Calendar, 
  Loader2, 
  Download, 
  Copy, 
  Check,
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { useToast } from '../../components/ui/use-toast';

const ContentCalendar = () => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('30');
  const [platforms, setPlatforms] = useState('Instagram, Twitter, LinkedIn');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or niche');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const prompt = `Generate a comprehensive ${duration}-day content calendar for "${topic}" targeting these platforms: ${platforms}.
      
      Please provide:
      1. Daily content ideas with specific post titles
      2. Suggested platforms for each post
      3. Content types (image, video, carousel, text, story, etc.)
      4. Best posting times
      5. Content themes organized by week
      6. Hashtag suggestions for each post
      7. Engagement strategies
      
      Format the calendar in a clear, day-by-day structure with actionable details.`;

      const response = await aiAPI.generate(prompt, {
        model: 'pro',
        temperature: 0.7,
        maxTokens: 4096,
      });

      setResult(response);
      toast({
        title: 'Success',
        description: 'Content calendar generated successfully!',
      });
    } catch (err) {
      console.error('Error generating calendar:', err);
      setError('Failed to generate content calendar. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to generate content calendar. Please try again.',
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
      description: 'Content calendar copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-calendar-${topic.replace(/\s+/g, '-')}-${duration}days.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded!',
      description: 'Content calendar exported successfully',
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
              Content Calendar
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate a comprehensive content calendar with AI-powered planning
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-emerald-500" />
                  Calendar Settings
                </CardTitle>
                <CardDescription>
                  Configure your content calendar parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Niche</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., fitness coaching, tech news, food blogging"
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days)</Label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="7">7 days (1 week)</option>
                    <option value="14">14 days (2 weeks)</option>
                    <option value="30">30 days (1 month)</option>
                    <option value="60">60 days (2 months)</option>
                    <option value="90">90 days (3 months)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platforms">Target Platforms</Label>
                  <Input
                    id="platforms"
                    value={platforms}
                    onChange={(e) => setPlatforms(e.target.value)}
                    placeholder="e.g., Instagram, Twitter, TikTok"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Separate platforms with commas
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md flex items-start">
                    <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Calendar...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Calendar
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Popular Topics:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Personal Branding', 'SaaS Marketing', 'Lifestyle Blog'].map((example) => (
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
                    Your Content Calendar
                  </CardTitle>
                  {result && (
                    <div className="flex gap-2">
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
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription>
                  AI-generated content calendar for your strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-75 blur-xl"></div>
                      <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full p-3">
                        <Calendar className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      Creating your {duration}-day content calendar...
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      This may take a moment
                    </p>
                  </div>
                ) : result ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div 
                      className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm whitespace-pre-wrap overflow-y-auto"
                      style={{ 
                        lineHeight: '1.8',
                        maxHeight: 'calc(100vh - 300px)'
                      }}
                    >
                      {result}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                      <Calendar className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No Calendar Generated Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md">
                      Enter your topic, duration, and target platforms, then click "Generate Calendar" to create your content plan
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-md">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        💡 <strong>Tip:</strong> Be specific with your topic for more targeted content ideas
                      </p>
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

export default ContentCalendar;

