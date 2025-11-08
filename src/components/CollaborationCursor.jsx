import { motion, AnimatePresence } from 'framer-motion';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useEffect, useState } from 'react';

const CollaborationCursor = ({ pageId }) => {
  const { usePageCursors, activeUsers } = useCollaboration();
  const pageCursors = usePageCursors(pageId);

  // Update cursor position on mouse move
  useEffect(() => {
    if (!pageId) return;

    const handleMouseMove = (e) => {
      // Cursor update will be handled by CollaborationContext
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pageId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {Object.entries(pageCursors || {}).map(([userId, cursor]) => {
          const user = activeUsers.find(u => u.uid === userId) || { uid: userId, name: cursor.userName || 'User' };
          if (!cursor || !cursor.x || !cursor.y) return null;

          return (
            <motion.div
              key={userId}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: cursor.x,
                y: cursor.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute"
              style={{
                transform: `translate(-50%, -50%)`,
              }}
            >
              <svg
                className="w-5 h-5 text-[hsl(200,100%,50%)]"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0L0 20h4l2-8 8-2-4-10z" />
              </svg>
              <div className="mt-2 px-2 py-1 rounded bg-slate-900/90 border border-[hsl(200,100%,50%)]/50 text-xs text-white whitespace-nowrap">
                {user.name || user.userName}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationCursor;

