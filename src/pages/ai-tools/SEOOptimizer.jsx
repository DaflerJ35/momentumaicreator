import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Target,
  BarChart3,
  Loader2,
  Copy,
  Sparkles,
  Eye,
  Link2,
  Hash
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';

const SEOOptimizer = () => {
  const [content, setContent] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [optimizedContent, setOptimizedContent] = useState('');

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setOptimizedContent('');

    try {
      const prompt = `Analyze this content for SEO optimization. ${targetKeyword ? `Target keyword: "${targetKeyword}"` : ''} ${url ? `URL: ${url}` : ''}

Content:
${content}

Provide a comprehensive SEO analysis including:
1. SEO score (0-100)
2. Keyword density analysis
3. Content length analysis
4. Readability score
5. Meta description suggestions
6. Title tag optimization
7. Heading structure analysis
8. Internal linking opportunities
9. Image optimization suggestions
10. Content improvements for better SEO

Format the response as JSON with this structure:
{
  "seoScore": number,
  "readabilityScore": number,
  "wordCount": number,
  "keywordDensity": number,
  "keywordUsage": number,
  "metaTitle": string,
  "metaDescription": string,
  "optimizedMetaTitle": string,
  "optimizedMetaDescription": string,
  "headings": {
    "h1": number,
    "h2": number,
    "h3": number,
    "issues": [string]
  },
  "contentIssues": [string],
  "strengths": [string],
  "recommendations": [string],
  "keywordSuggestions": [string],
  "internalLinkingOpportunities": [string],
  "imageOptimizationSuggestions": [string],
  "overallAssessment": string
}`;

      const schema = {
        type: 'object',
        properties: {
          seoScore: { type: 'number' },
          readabilityScore: { type: 'number' },
          wordCount: { type: 'number' },
          keywordDensity: { type: 'number' },
          keywordUsage: { type: 'number' },
          metaTitle: { type: 'string' },
          metaDescription: { type: 'string' },
          optimizedMetaTitle: { type: 'string' },
          optimizedMetaDescription: { type: 'string' },
          headings: {
            type: 'object',
            properties: {
              h1: { type: 'number' },
              h2: { type: 'number' },
              h3: { type: 'number' },
              issues: { type: 'array', items: { type: 'string' } }
            }
          },
          contentIssues: { type: 'array', items: { type: 'string' } },
          strengths: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          keywordSuggestions: { type: 'array', items: { type: 'string' } },
          internalLinkingOpportunities: { type: 'array', items: { type: 'string' } },
          imageOptimizationSuggestions: { type: 'array', items: { type: 'string' } },
          overallAssessment: { type: 'string' }
        },
        required: ['seoScore', 'readabilityScore', 'wordCount']
      };

      const result = await aiAPI.generateStructured(prompt, schema, {
        model: 'pro',
        temperature: 0.3,
        maxTokens: 2048,
      });

      setAnalysis(result);

      // Generate optimized content
      const optimizePrompt = `Optimize this content for SEO while maintaining readability and natural flow. ${targetKeyword ? `Focus on keyword: "${targetKeyword}"` : ''}

Original content:
${content}

Provide the optimized version with:
- Better keyword placement
- Improved heading structure
- Enhanced readability
- SEO best practices applied
- Maintain the original meaning and tone`;

      const optimized = await aiAPI.generate(optimizePrompt, {
        model: 'pro',
        temperature: 0.5,
        maxTokens: 4096,
      });

      setOptimizedContent(optimized);
      toast.success('SEO analysis completed!');
    } catch (error) {
      console.error('SEO analysis error:', error);
      toast.error(error.message || 'Failed to analyze SEO. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/50';
    if (score >= 60) return 'bg-amber-500/20 border-amber-500/50';
    return 'bg-rose-500/20 border-rose-500/50';
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
            <Search className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">SEO Optimizer</h1>
            <p className="text-slate-400 mt-1">AI-powered SEO analysis and optimization</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-700/50 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Content Analysis</CardTitle>
              <CardDescription>Enter your content for SEO optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetKeyword" className="text-slate-300">Target Keyword (Optional)</Label>
                <Input
                  id="targetKeyword"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g., content marketing strategy"
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <Label htmlFor="url" className="text-slate-300">URL (Optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="mt-2 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <Label htmlFor="content" className="text-slate-300">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your article, blog post, or webpage content here..."
                  className="mt-2 min-h-[300px] bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <Button
                onClick={handleAnalyze}
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
                    <Search className="h-4 w-4 mr-2" />
                    Analyze SEO
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Optimized Content */}
          {optimizedContent && (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Optimized Content</CardTitle>
                    <CardDescription>AI-optimized version of your content</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(optimizedContent)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                    {optimizedContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {analysis ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* SEO Score */}
              <Card className={`border-slate-700/50 bg-slate-800/50 ${getScoreBgColor(analysis.seoScore)}`}>
                <CardHeader>
                  <CardTitle className="text-white">SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.seoScore)}`}>
                      {analysis.seoScore}
                    </div>
                    <div className="text-sm text-slate-400">
                      out of 100
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="border-slate-700/50 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-slate-300">Word Count</span>
                    </div>
                    <span className="text-white font-semibold">{analysis.wordCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-purple-400" />
                      <span className="text-slate-300">Readability</span>
                    </div>
                    <span className={`font-semibold ${getScoreColor(analysis.readabilityScore)}`}>
                      {analysis.readabilityScore}/100
                    </span>
                  </div>
                  {targetKeyword && analysis.keywordDensity !== undefined && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-emerald-400" />
                          <span className="text-slate-300">Keyword Density</span>
                        </div>
                        <span className="text-white font-semibold">{analysis.keywordDensity?.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-amber-400" />
                          <span className="text-slate-300">Keyword Usage</span>
                        </div>
                        <span className="text-white font-semibold">{analysis.keywordUsage || 0}x</span>
                      </div>
                    </>
                  )}
                  {analysis.headings && (
                    <div className="pt-2 border-t border-slate-700 space-y-2">
                      <div className="text-sm text-slate-400 mb-2">Headings</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">H1</span>
                        <span className="text-white">{analysis.headings.h1 || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">H2</span>
                        <span className="text-white">{analysis.headings.h2 || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">H3</span>
                        <span className="text-white">{analysis.headings.h3 || 0}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meta Tags */}
              {(analysis.optimizedMetaTitle || analysis.optimizedMetaDescription) && (
                <Card className="border-slate-700/50 bg-slate-800/50">
                  <CardHeader>
                    <CardTitle className="text-white">Optimized Meta Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysis.optimizedMetaTitle && (
                      <div>
                        <Label className="text-slate-400 text-sm mb-2 block">Title Tag</Label>
                        <div className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{analysis.optimizedMetaTitle}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(analysis.optimizedMetaTitle)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-slate-400">
                            {analysis.optimizedMetaTitle.length} characters
                          </div>
                        </div>
                      </div>
                    )}
                    {analysis.optimizedMetaDescription && (
                      <div>
                        <Label className="text-slate-400 text-sm mb-2 block">Meta Description</Label>
                        <div className="p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-slate-300 text-sm">{analysis.optimizedMetaDescription}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(analysis.optimizedMetaDescription)}
                              className="h-6 w-6 p-0 mt-0.5"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-slate-400">
                            {analysis.optimizedMetaDescription.length} characters
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-400">
                  Enter your content and click "Analyze SEO" to get AI-powered optimization suggestions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Analysis */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Issues */}
          {analysis.contentIssues && analysis.contentIssues.length > 0 && (
            <Card className="border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.contentIssues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30">
                      <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Keyword Suggestions */}
          {analysis.keywordSuggestions && analysis.keywordSuggestions.length > 0 && (
            <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-400" />
                  Related Keyword Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordSuggestions.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300 border border-slate-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overall Assessment */}
          {analysis.overallAssessment && (
            <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Overall Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">{analysis.overallAssessment}</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default SEOOptimizer;

