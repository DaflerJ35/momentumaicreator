import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { FloatingElement } from './animations/FloatingElements';

const ActiveUsersIndicator = () => {
  const { activeUsers, isConnected } = useCollaboration();

  if (!isConnected || activeUsers.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="glass-morphism border border-white/20 rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-3">
          <FloatingElement>
            <div className="relative">
              <Users className="h-5 w-5 text-[hsl(200,100%,50%)]" />
              {activeUsers.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-[hsl(200,100%,50%)] rounded-full border-2 border-slate-900"
                />
              )}
            </div>
          </FloatingElement>
          <div>
            <div className="text-xs text-slate-400">Active Users</div>
            <div className="text-sm font-semibold text-white">{activeUsers.length}</div>
          </div>
        </div>
        
        {/* User avatars */}
        {activeUsers.length > 0 && (
          <div className="flex -space-x-2 mt-2">
            {activeUsers.slice(0, 3).map((user) => (
              <motion.img
                key={user.uid}
                src={user.photoURL || '/default-avatar.png'}
                alt={user.name || 'User'}
                className="w-6 h-6 rounded-full border-2 border-slate-800"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                title={user.name || 'User'}
              />
            ))}
            {activeUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-xs text-white">
                +{activeUsers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActiveUsersIndicator;

