import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Clock, 
  Users, 
  Heart, 
  MessageSquare,
  Share2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';

const PerformancePredictor = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [contentType, setContentType] = useState('post');
  const [targetAudience, setTargetAudience] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube', 'Pinterest'];
  const contentTypes = ['post', 'story', 'reel', 'video', 'carousel', 'article', 'tweet'];

  const handlePredict = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setLoading(true);
    setPrediction(null);
    setSuggestions([]);

    try {
      const prompt = `Analyze this content and predict its performance on ${platform} as a ${contentType}.

Content:
${content}

${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${hashtags ? `Hashtags: ${hashtags}` : ''}

Provide a comprehensive performance prediction including:
1. Predicted engagement rate (0-100%)
2. Estimated reach
3. Estimated likes/reactions
4. Estimated comments/shares
5. Best posting time
6. Content strength score (0-100)
7. Areas for improvement
8. Optimization suggestions

Format the response as JSON with this structure:
{
  "engagementRate": number,
  "estimatedReach": number,
  "estimatedLikes": number,
  "estimatedComments": number,
  "estimatedShares": number,
  "contentScore": number,
  "bestPostingTime": string,
  "strengths": [string],
  "weaknesses": [string],
  "optimizationSuggestions": [string],
  "riskFactors": [string],
  "predictedPerformance": "high" | "medium" | "low",
  "confidence": number
}`;

      const schema = {
        type: 'object',
        properties: {
          engagementRate: { type: 'number' },
          estimatedReach: { type: 'number' },
          estimatedLikes: { type: 'number' },
          estimatedComments: { type: 'number' },
          estimatedShares: { type: 'number' },
          contentScore: { type: 'number' },
          bestPostingTime: { type: 'string' },
          strengths: { type: 'array', items: { type: 'string' } },
          weaknesses: { type: 'array', items: { type: 'string' } },
          optimizationSuggestions: { type: 'array', items: { type: 'string' } },
          riskFactors: { type: 'array', items: { type: 'string' } },
          predictedPerformance: { type: 'string', enum: ['high', 'medium', 'low'] },
          confidence: { type: 'number' }
        },
        required: ['engagementRate', 'contentScore', 'predictedPerformance', 'confidence']
      };

      const result = await aiAPI.generateStructured(prompt, schema, {
        model: 'pro',
        temperature: 0.3,
        maxTokens: 2048,
      });

      setPrediction(result);

      // Generate optimization suggestions
      if (result.optimizationSuggestions && result.optimizationSuggestions.length > 0) {
        setSuggestions(result.optimizationSuggestions);
      }

      toast.success('Performance prediction generated!');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error(error.message || 'Failed to generate prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'high':
        return 'text-emerald-400';
      case 'medium':
        return 'text-amber-400';
      case 'low':
        return 'text-rose-400';
      default:
        return 'text-slate-400';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
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
            <Target className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Performance Predictor</h1>
            <p className="text-slate-400 mt-1">Predict content performance before publishing</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-700/50 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Content Details</CardTitle>
              <CardDescription>Enter your content to analyze performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform" className="text-slate-300">Platform</Label>
                  <select
                    id="platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="contentType" className="text-slate-300">Content Type</Label>
                  <select
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full mt-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {contentTypes.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="content" className="text-slate-300">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your content here (caption, post text, article, etc.)"
                  className="mt-2 min-h-[200px] bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience" className="text-slate-300">Target Audience (Optional)</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Marketing professionals aged 25-40"
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <Label htmlFor="hashtags" className="text-slate-300">Hashtags (Optional)</Label>
                <Input
                  id="hashtags"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#marketing #content #socialmedia"
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <Button
                onClick={handlePredict}
                disabled={loading || !content.trim()}
                className="w-full btn-premium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Predict Performance
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Prediction Results */}
        <div className="space-y-6">
          {prediction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Performance Score */}
              <Card className="border-slate-700/50 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Prediction Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(prediction.contentScore)}`}>
                      {prediction.contentScore}
                    </div>
                    <div className={`text-lg font-semibold ${getPerformanceColor(prediction.predictedPerformance)}`}>
                      {prediction.predictedPerformance?.toUpperCase()} Performance
                    </div>
                    <div className="text-sm text-slate-400 mt-2">
                      Confidence: {prediction.confidence}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="border-slate-700/50 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Predicted Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" />
                      <span className="text-slate-300">Engagement Rate</span>
                    </div>
                    <span className="text-white font-semibold">{prediction.engagementRate?.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-300">Estimated Reach</span>
                    </div>
                    <span className="text-white font-semibold">{prediction.estimatedReach?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-400" />
                      <span className="text-slate-300">Estimated Likes</span>
                    </div>
                    <span className="text-white font-semibold">{prediction.estimatedLikes?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                      <span className="text-slate-300">Estimated Comments</span>
                    </div>
                    <span className="text-white font-semibold">{prediction.estimatedComments?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-cyan-400" />
                      <span className="text-slate-300">Estimated Shares</span>
                    </div>
                    <span className="text-white font-semibold">{prediction.estimatedShares?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="text-slate-300">Best Time</span>
                    </div>
                    <span className="text-white font-semibold">{prediction.bestPostingTime}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!prediction && (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardContent className="p-8 text-center">
                <Sparkles className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-400">
                  Enter your content and click "Predict Performance" to see AI-powered predictions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Analysis Details */}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Strengths */}
          {prediction.strengths && prediction.strengths.length > 0 && (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {prediction.weaknesses && prediction.weaknesses.length > 0 && (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Optimization Suggestions */}
          {prediction.optimizationSuggestions && prediction.optimizationSuggestions.length > 0 && (
            <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  Optimization Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {prediction.optimizationSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
                      <TrendingUp className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Risk Factors */}
          {prediction.riskFactors && prediction.riskFactors.length > 0 && (
            <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PerformancePredictor;

