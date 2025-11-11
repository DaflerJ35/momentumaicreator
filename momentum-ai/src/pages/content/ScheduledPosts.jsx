import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { PLATFORMS } from '../../lib/platforms';
import { unifiedAPI } from '../../lib/unifiedAPI';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';

const ScheduledPosts = () => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      // This would call an API endpoint to get scheduled posts
      // For now, we'll use a placeholder
      const posts = []; // TODO: Implement API endpoint
      setScheduledPosts(posts);
    } catch (error) {
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      // TODO: Implement delete API
      setScheduledPosts(scheduledPosts.filter(p => p.id !== postId));
      toast.success('Scheduled post deleted');
    } catch (error) {
      toast.error('Failed to delete scheduled post');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">Scheduled Posts</h1>
          <p className="text-slate-400 text-lg">
            Manage your scheduled content across all platforms
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
          </div>
        ) : scheduledPosts.length === 0 ? (
          <Card className="glass-morphism border border-white/10">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Scheduled Posts</h3>
              <p className="text-slate-400 mb-6">
                Schedule your first post to see it here
              </p>
              <Button
                onClick={() => window.location.href = '/publish'}
                className="bg-gradient-to-r from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)]"
              >
                Create Scheduled Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {scheduledPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-morphism border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {PLATFORMS[post.platformId]?.icon || '📱'}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {PLATFORMS[post.platformId]?.name || post.platformId}
                          </h3>
                          <p className="text-sm text-slate-400">
                            Scheduled for {formatDate(post.scheduleTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.status === 'scheduled' && (
                          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                            Scheduled
                          </span>
                        )}
                        {post.status === 'published' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Published
                          </span>
                        )}
                        {post.status === 'failed' && (
                          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="h-4 w-4" />
                        {formatDate(post.scheduleTime)}
                      </div>
                      <div className="flex gap-2">
                        {post.status === 'scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-700 text-slate-300"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDelete(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledPosts;

