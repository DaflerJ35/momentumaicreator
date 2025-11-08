import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, serverTimestamp, off } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from './AuthContext';

const CollaborationContext = createContext(null);

export const CollaborationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [presence, setPresence] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Initialize presence
  useEffect(() => {
    if (!currentUser || !database) return;

    const userPresenceRef = ref(database, `presence/${currentUser.uid}`);
    const connectedRef = ref(database, '.info/connected');

    // Set user as online
    const setOnline = () => {
      set(userPresenceRef, {
        online: true,
        lastSeen: serverTimestamp(),
        name: currentUser.displayName || currentUser.email,
        photoURL: currentUser.photoURL,
      });
    };

    // Set user as offline
    const setOffline = () => {
      set(userPresenceRef, {
        online: false,
        lastSeen: serverTimestamp(),
      });
    };

    // Monitor connection
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        setIsConnected(true);
        setOnline();

        // Set offline when disconnected
        const onDisconnectRef = ref(database, `presence/${currentUser.uid}`);
        set(onDisconnectRef, {
          online: false,
          lastSeen: serverTimestamp(),
        });
      } else {
        setIsConnected(false);
      }
    });

    // Cleanup
    return () => {
      setOffline();
      off(connectedRef);
      off(userPresenceRef);
    };
  }, [currentUser]);

  // Monitor active users
  useEffect(() => {
    if (!database) return;

    const presenceRef = ref(database, 'presence');
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const presenceData = snapshot.val();
      if (presenceData) {
        const users = Object.entries(presenceData)
          .filter(([uid, data]) => data.online && uid !== currentUser?.uid)
          .map(([uid, data]) => ({ uid, ...data }));
        setActiveUsers(users);
        setPresence(presenceData);
      }
    });

    return () => {
      off(presenceRef);
    };
  }, [currentUser]);

  // Update cursor position
  const updateCursor = useCallback((pageId, x, y) => {
    if (!currentUser || !database) return;

    const cursorRef = ref(database, `cursors/${pageId}/${currentUser.uid}`);
    set(cursorRef, {
      x,
      y,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
    });
  }, [currentUser]);

  // Monitor cursors
  useEffect(() => {
    if (!database || !currentUser) return;

    const cursorsRef = ref(database, 'cursors');
    
    const unsubscribe = onValue(cursorsRef, (snapshot) => {
      const cursorsData = snapshot.val();
      if (cursorsData) {
        // Flatten nested cursor structure
        const allCursors = {};
        Object.entries(cursorsData).forEach(([pageId, pageCursors]) => {
          Object.entries(pageCursors).forEach(([uid, cursor]) => {
            if (uid !== currentUser.uid && cursor) {
              allCursors[`${pageId}-${uid}`] = { pageId, ...cursor };
            }
          });
        });
        setCursors(allCursors);
      }
    });

    return () => {
      off(cursorsRef);
    };
  }, [currentUser]);

  // Broadcast typing status
  const broadcastTyping = useCallback((pageId, isTyping) => {
    if (!currentUser || !database) return;

    const typingRef = ref(database, `typing/${pageId}/${currentUser.uid}`);
    if (isTyping) {
      set(typingRef, {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        timestamp: serverTimestamp(),
      });
    } else {
      set(typingRef, null);
    }
  }, [currentUser]);

  // Send real-time message
  const sendMessage = useCallback((roomId, message) => {
    if (!currentUser || !database) return;

    const messageRef = ref(database, `messages/${roomId}/${Date.now()}`);
    set(messageRef, {
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      photoURL: currentUser.photoURL,
      message,
      timestamp: serverTimestamp(),
    });
  }, [currentUser]);

  const value = {
    activeUsers,
    cursors,
    presence,
    isConnected,
    updateCursor,
    broadcastTyping,
    sendMessage,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};

export default CollaborationContext;

