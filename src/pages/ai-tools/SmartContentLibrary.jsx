import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Search, 
  FileText, 
  Filter,
  Calendar,
  Tag,
  Copy,
  Eye,
  TrendingUp,
  Sparkles,
  Loader2,
  X,
  Plus,
  Download,
  Archive
} from 'lucide-react';
import { aiAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';

const SmartContentLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentItems, setContentItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [loading, setLoading] = useState(false);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data - in production, this would come from Firebase or your backend
  useEffect(() => {
    // Simulate loading content from storage
    const mockContent = [
      {
        id: '1',
        title: '10 AI Tools for Content Creation',
        content: 'Discover the best AI tools that can help you create amazing content faster and more efficiently...',
        category: 'blog',
        tags: ['ai', 'tools', 'content'],
        date: '2024-01-15',
        views: 1234,
        engagement: 8.5,
        platform: 'blog'
      },
      {
        id: '2',
        title: 'Social Media Marketing Tips',
        content: 'Learn how to effectively market your brand on social media platforms...',
        category: 'social',
        tags: ['marketing', 'social media'],
        date: '2024-01-10',
        views: 856,
        engagement: 7.2,
        platform: 'instagram'
      },
      {
        id: '3',
        title: 'Content Strategy Guide',
        content: 'A comprehensive guide to building a successful content strategy...',
        category: 'guide',
        tags: ['strategy', 'content'],
        date: '2024-01-05',
        views: 2100,
        engagement: 9.1,
        platform: 'blog'
      },
    ];
    setContentItems(mockContent);
    setFilteredItems(mockContent);
  }, []);

  const categories = [
    { value: 'all', label: 'All Content' },
    { value: 'blog', label: 'Blog Posts' },
    { value: 'social', label: 'Social Media' },
    { value: 'video', label: 'Videos' },
    { value: 'email', label: 'Email' },
    { value: 'guide', label: 'Guides' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredItems(contentItems);
      return;
    }

    // Regular text search
    const textResults = contentItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // If text search finds results, use them
    if (textResults.length > 0) {
      setFilteredItems(textResults);
      return;
    }

    // AI-powered semantic search
    setAiSearchLoading(true);
    try {
      const prompt = `I have a content library with these items:
${contentItems.map(item => `- ${item.title}: ${item.content.substring(0, 200)}...`).join('\n')}

User is searching for: "${searchQuery}"

Find semantically similar or related content items. Return a JSON array of item IDs that match the search query semantically, even if they don't contain the exact keywords.

Return format:
{
  "matchingIds": ["id1", "id2"],
  "reason": "explanation of why these match"
}`;

      const schema = {
        type: 'object',
        properties: {
          matchingIds: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' }
        },
        required: ['matchingIds']
      };

      const result = await aiAPI.generateStructured(prompt, schema, {
        model: 'pro',
        temperature: 0.3,
        maxTokens: 512,
      });

      const aiResults = contentItems.filter(item => 
        result.matchingIds.includes(item.id)
      );

      if (aiResults.length > 0) {
        setFilteredItems(aiResults);
        toast.success(`Found ${aiResults.length} semantically similar content`);
      } else {
        setFilteredItems([]);
        toast.info('No matching content found');
      }
    } catch (error) {
      console.error('AI search error:', error);
      toast.error('AI search failed. Showing text results.');
      setFilteredItems(textResults);
    } finally {
      setAiSearchLoading(false);
    }
  };

  useEffect(() => {
    let results = contentItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(item => item.category === selectedCategory);
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedDateRange) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }

      results = results.filter(item => new Date(item.date) >= filterDate);
    }

    // Apply text search if query exists
    if (searchQuery.trim()) {
      results = results.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(results);
  }, [selectedCategory, selectedDateRange, searchQuery, contentItems]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getEngagementColor = (engagement) => {
    if (engagement >= 8) return 'text-emerald-400';
    if (engagement >= 6) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm border border-emerald-500/30">
              <Archive className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Smart Content Library</h1>
              <p className="text-slate-400 mt-1">AI-powered content discovery and organization</p>
            </div>
          </div>
          <Button className="btn-premium">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="border-slate-700/50 bg-slate-800/50 mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search content with AI-powered semantic search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredItems(contentItems);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-slate-400 text-sm mb-2 block">Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label className="text-slate-400 text-sm mb-2 block">Date Range</Label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={aiSearchLoading}
                  className="btn-premium"
                >
                  {aiSearchLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      AI Searching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-slate-400">
          Found {filteredItems.length} content item{filteredItems.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="border-slate-700/50 bg-slate-800/50 hover:border-emerald-500/50 transition-all cursor-pointer h-full"
                onClick={() => setSelectedItem(item)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <Tag className="h-4 w-4" />
                        <span className="capitalize">{item.category}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                    {item.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Eye className="h-4 w-4" />
                        <span>{item.views}</span>
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${getEngagementColor(item.engagement)}`}>
                        <TrendingUp className="h-4 w-4" />
                        <span>{item.engagement}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-slate-700/50 bg-slate-800/50">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">No content found</p>
            <p className="text-slate-500 text-sm">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Detail Modal */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <Card className="border-0 bg-transparent">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl mb-2">
                      {selectedItem.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedItem.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span className="capitalize">{selectedItem.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{selectedItem.views} views</span>
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${getEngagementColor(selectedItem.engagement)}`}>
                        <TrendingUp className="h-4 w-4" />
                        <span>{selectedItem.engagement}% engagement</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.content}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-700/50 rounded-full text-sm text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <Button
                    onClick={() => copyToClipboard(selectedItem.content)}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Content
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SmartContentLibrary;

