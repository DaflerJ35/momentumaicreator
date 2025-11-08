import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Zap, 
  Loader2, 
  Hash, 
  Copy, 
  Check,
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { useToast } from '../../components/ui/use-toast';

const HashtagGenerator = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [result, setResult] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook'];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setHashtags([]);

    try {
      const prompt = `Generate a comprehensive list of high-performing hashtags for "${topic}" on ${platform}.
      
      Please provide:
      1. 10 highly relevant trending hashtags
      2. 5 niche-specific hashtags
      3. 5 branded/community hashtags
      4. Tips for optimal hashtag usage on ${platform}
      
      Format the hashtags clearly with the # symbol and provide brief explanations for the top hashtags.`;

      const response = await aiAPI.generate(prompt, {
        model: 'pro',
        temperature: 0.7,
        maxTokens: 2048,
      });

      setResult(response);
      
      // Extract hashtags from response
      const hashtagMatches = response.match(/#[\w\d]+/g) || [];
      setHashtags([...new Set(hashtagMatches)]);

      toast({
        title: 'Success',
        description: 'Hashtags generated successfully!',
      });
    } catch (err) {
      console.error('Error generating hashtags:', err);
      setError('Failed to generate hashtags. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to generate hashtags. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const hashtagString = hashtags.join(' ');
    navigator.clipboard.writeText(hashtagString);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Hashtags copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: 'Copied!',
      description: 'Full analysis copied to clipboard',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              Hashtag Generator
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate high-performing hashtags for your social media posts with AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="mr-2 h-5 w-5 text-emerald-500" />
                  Generation Settings
                </CardTitle>
                <CardDescription>
                  Configure your hashtag generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Content Theme</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., travel photography, fitness motivation, tech startup"
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Target Platform</Label>
                  <select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
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
                  onClick={handleGenerate} 
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Hashtags...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Hashtags
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Example Topics:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Travel Vlog', 'Fitness Tips', 'Food Photography', 'Tech Reviews'].map((example) => (
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-emerald-500" />
                    Generated Hashtags
                  </CardTitle>
                  {hashtags.length > 0 && (
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
                  AI-generated hashtags for your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-75 blur-xl"></div>
                      <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full p-3">
                        <Hash className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Generating optimal hashtags...
                    </p>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    {hashtags.length > 0 && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                          Quick Copy ({hashtags.length} hashtags)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {hashtags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(tag);
                                toast({
                                  title: 'Copied!',
                                  description: `${tag} copied to clipboard`,
                                });
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="prose dark:prose-invert max-w-none">
                      <div 
                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm whitespace-pre-wrap overflow-y-auto max-h-[400px]"
                        style={{ lineHeight: '1.6' }}
                      >
                        {result}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAll}
                      className="w-full"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Full Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                      <Hash className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No Hashtags Generated Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                      Enter a topic and platform, then click "Generate Hashtags" to get started
                    </p>
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

export default HashtagGenerator;

