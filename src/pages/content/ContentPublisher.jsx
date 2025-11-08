import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PLATFORMS, getPlatformsByCategory } from '../../lib/platforms';
import { unifiedAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';
import { 
  Send, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ContentPublisher = () => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [media, setMedia] = useState([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectedPlatforms();
  }, []);

  const loadConnectedPlatforms = async () => {
    try {
      setLoading(true);
      const response = await unifiedAPI.get('/platforms/connected');
      if (response.success) {
        setConnectedPlatforms(response.platforms.map(p => p.platformId));
      }
    } catch (error) {
      console.error('Failed to load connected platforms:', error);
      toast.error('Failed to load connected platforms');
    } finally {
      setLoading(false);
    }
  };

  // Filter platforms to only show connected ones
  const subscriptionPlatforms = getPlatformsByCategory('subscription').filter(p => connectedPlatforms.includes(p.id));
  const socialPlatforms = getPlatformsByCategory('social').filter(p => connectedPlatforms.includes(p.id));
  const blogPlatforms = getPlatformsByCategory('blog').filter(p => connectedPlatforms.includes(p.id));

  const allPlatforms = [...subscriptionPlatforms, ...socialPlatforms, ...blogPlatforms];

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to publish');
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setPublishing(true);
    setResults([]);

    try {
      const response = await unifiedAPI.post('/platforms/schedule', {
        platforms: selectedPlatforms,
        content,
        media,
        scheduleTime: scheduleTime || null,
        options: {},
      });

      if (response.data.success) {
        setResults(response.data.results);
        toast.success(`Content ${scheduleTime ? 'scheduled' : 'published'} to ${selectedPlatforms.length} platform(s)`);
        
        // Reset form if immediate publish
        if (!scheduleTime) {
          setContent('');
          setSelectedPlatforms([]);
          setMedia([]);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to publish content');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 relative cosmic-bg">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="galaxy-bg" />
        <div className="stars-layer" />
        <div className="nebula-glow w-96 h-96 bg-neon-violet top-20 left-10" />
        <div className="nebula-glow w-80 h-80 bg-neon-magenta bottom-20 right-10" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Content Publisher</h1>
          <p className="text-slate-400 text-lg">
            Create once, publish everywhere. Distribute your content across all connected platforms.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content" className="text-slate-300">Your Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your content here..."
                    className="mt-2 min-h-[300px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-400 mt-2">{content.length} characters</p>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300"
                    onClick={() => document.getElementById('media-upload')?.click()}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Media
                  </Button>
                  <input
                    id="media-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setMedia(files);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Scheduling */}
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-neon-blue" />
                  Schedule (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Leave empty to publish immediately
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Platform Selection */}
          <div className="space-y-6">
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Select Platforms</CardTitle>
                {connectedPlatforms.length === 0 && (
                  <p className="text-sm text-amber-400 mt-2">
                    No platforms connected. <a href="/integrations" className="underline">Connect platforms first</a>
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {subscriptionPlatforms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neon-violet mb-2">Subscription</h3>
                    <div className="space-y-2">
                      {subscriptionPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <Label
                          htmlFor={platform.id}
                          className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
                        >
                          <span>{platform.icon}</span>
                          {platform.name}
                        </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {socialPlatforms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neon-blue mb-2">Social Media</h3>
                    <div className="space-y-2">
                      {socialPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <Label
                          htmlFor={platform.id}
                          className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
                        >
                          <span>{platform.icon}</span>
                          {platform.name}
                        </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {blogPlatforms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neon-magenta mb-2">Blogs</h3>
                    <div className="space-y-2">
                      {blogPlatforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform.id}
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <Label
                          htmlFor={platform.id}
                          className="text-sm text-slate-300 cursor-pointer flex items-center gap-2"
                        >
                          <span>{platform.icon}</span>
                          {platform.name}
                        </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={publishing || !content.trim() || selectedPlatforms.length === 0 || connectedPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)] hover:from-[hsl(280,85%,60%)] hover:to-[hsl(320,90%,55%)] text-white disabled:opacity-50"
              size="lg"
            >
              {publishing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  {scheduleTime ? 'Schedule' : 'Publish Now'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="glass-morphism border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Publishing Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="text-white">{PLATFORMS[result.platform]?.name || result.platform}</span>
                      </div>
                      <span className={`text-sm ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.success ? 'Success' : result.result}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ContentPublisher;

