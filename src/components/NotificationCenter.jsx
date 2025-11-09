import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  Users,
  MessageSquare,
  Sparkles,
  Clock
} from 'lucide-react';
import { useNotifications, NOTIFICATION_TYPES } from '../contexts/NotificationContext';
// Format timestamp helper
const formatDistanceToNow = (timestamp, options = {}) => {
  if (!timestamp) return 'Just now';
  
  try {
    // Handle Firebase timestamp
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Just now';
    
    // Custom implementation
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch (error) {
    return 'Just now';
  }
};

const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return CheckCircle;
      case NOTIFICATION_TYPES.ERROR:
        return AlertCircle;
      case NOTIFICATION_TYPES.WARNING:
        return AlertTriangle;
      case NOTIFICATION_TYPES.USER_JOINED:
      case NOTIFICATION_TYPES.USER_LEFT:
        return Users;
      case NOTIFICATION_TYPES.MESSAGE:
        return MessageSquare;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case NOTIFICATION_TYPES.ERROR:
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case NOTIFICATION_TYPES.WARNING:
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case NOTIFICATION_TYPES.USER_JOINED:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case NOTIFICATION_TYPES.USER_LEFT:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case NOTIFICATION_TYPES.MESSAGE:
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-[hsl(200,100%,50%)] bg-[hsl(200,100%,50%)]/10 border-[hsl(200,100%,50%)]/20';
    }
  };


  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-400" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-[hsl(200,100%,50%)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Center Panel */}
      <AnimatePresence>
        {isNotificationCenterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationCenterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] z-50 glass-morphism border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[hsl(200,100%,50%)]" />
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-[hsl(200,100%,50%)] text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsNotificationCenterOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-2">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-400 text-lg font-medium">No notifications</p>
                    <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification, index) => {
                      const Icon = getNotificationIcon(notification.type);
                      const colorClass = getNotificationColor(notification.type);

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative p-3 rounded-lg border transition-all ${
                            notification.read
                              ? 'bg-slate-800/30 border-slate-700/50'
                              : 'bg-slate-800/60 border-white/10 shadow-lg'
                          } ${colorClass}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="text-white font-medium text-sm">
                                    {notification.title}
                                  </h4>
                                  {notification.message && (
                                    <p className="text-slate-400 text-xs mt-1">
                                      {notification.message}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="h-3 w-3 text-slate-500" />
                                    <span className="text-xs text-slate-500">
                                      {formatDistanceToNow(notification.timestamp)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="p-1 rounded hover:bg-slate-700/50 transition-colors"
                                      title="Mark as read"
                                    >
                                      <Check className="h-3 w-3 text-slate-400" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="p-1 rounded hover:bg-slate-700/50 transition-colors"
                                    title="Delete"
                                  >
                                    <X className="h-3 w-3 text-slate-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="absolute top-3 right-3 h-2 w-2 bg-[hsl(200,100%,50%)] rounded-full" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10 bg-slate-900/50">
                  <button
                    onClick={clearAllNotifications}
                    className="w-full py-2 px-4 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;

