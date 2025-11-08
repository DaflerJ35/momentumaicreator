import { motion, AnimatePresence } from 'framer-motion';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useMemo } from 'react';

const CollaborationCursor = ({ pageId }) => {
  const { getPageCursors, activeUsers } = useCollaboration();
  
  // Get cursors for this page
  const pageCursors = useMemo(() => {
    if (!pageId) return {};
    return getPageCursors(pageId);
  }, [pageId, getPageCursors]);

  // Filter out invalid cursors
  const validCursors = Object.entries(pageCursors || {}).filter(([userId, cursor]) => {
    return cursor && typeof cursor.x === 'number' && typeof cursor.y === 'number' && 
           cursor.x >= 0 && cursor.y >= 0 && 
           cursor.x <= window.innerWidth && cursor.y <= window.innerHeight;
  });

  if (validCursors.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {validCursors.map(([userId, cursor]) => {
          const user = activeUsers.find(u => u.uid === userId) || { 
            uid: userId, 
            name: cursor?.userName || cursor?.name || 'User' 
          };
          
          return (
            <motion.div
              key={userId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute"
              style={{
                left: `${cursor.x}px`,
                top: `${cursor.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg
                className="w-5 h-5 text-[hsl(200,100%,50%)] drop-shadow-lg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0L0 20h4l2-8 8-2-4-10z" />
              </svg>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 px-2 py-1 rounded bg-slate-900/90 border border-[hsl(200,100%,50%)]/50 text-xs text-white whitespace-nowrap shadow-lg"
              >
                {user.name || user.userName || 'User'}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationCursor;
