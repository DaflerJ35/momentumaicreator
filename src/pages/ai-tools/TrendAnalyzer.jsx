import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  BarChart2, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  Copy, 
  Check,
  AlertCircle 
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { useToast } from '../../components/ui/use-toast';

const TrendAnalyzer = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or niche');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const prompt = `Analyze trending topics and emerging patterns related to "${topic}". 
      
      Please provide:
      1. Current trending topics (3-5 items)
      2. Emerging trends to watch
      3. Content opportunities
      4. Audience engagement insights
      5. Recommended posting times/frequency
      
      Format the response in a clear, actionable way.`;

      const response = await aiAPI.generate(prompt, {
        model: 'pro',
        temperature: 0.7,
        maxTokens: 2048,
      });

      setResult(response);
      toast({
        title: 'Success',
        description: 'Trend analysis completed!',
      });
    } catch (err) {
      console.error('Error analyzing trends:', err);
      setError('Failed to analyze trends. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to analyze trends. Please try again.',
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
      description: 'Analysis copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
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
              Trend Analyzer
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Discover trending topics and emerging patterns in your niche with AI insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5 text-emerald-500" />
                  Analysis Parameters
                </CardTitle>
                <CardDescription>
                  Enter a topic or niche to analyze current trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Niche</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., AI technology, fitness, sustainable fashion"
                    onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  />
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md flex items-start">
                    <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleAnalyze} 
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Trends...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Analyze Trends
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                    Example Topics:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['AI & Technology', 'Digital Marketing', 'Health & Wellness', 'E-commerce'].map((example) => (
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
                    Trend Insights
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
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <CardDescription>
                  AI-powered trend analysis results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full opacity-75 blur-xl"></div>
                      <div className="relative bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full p-3">
                        <BarChart2 className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Analyzing trends and gathering insights...
                    </p>
                  </div>
                ) : result ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div 
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm whitespace-pre-wrap overflow-y-auto max-h-[500px]"
                      style={{ lineHeight: '1.6' }}
                    >
                      {result}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                      <BarChart2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No Analysis Yet
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                      Enter a topic and click "Analyze Trends" to discover trending topics and insights
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

export default TrendAnalyzer;

