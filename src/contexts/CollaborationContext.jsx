import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, serverTimestamp, off, onDisconnect } from 'firebase/database';
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
    if (!currentUser || !database || database._isMock) {
      // Provide mock values when Firebase is not available
      setIsConnected(false);
      return;
    }

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

        // Set offline when disconnected using onDisconnect
        if (userPresenceRef) {
          onDisconnect(userPresenceRef).set({
            online: false,
            lastSeen: serverTimestamp(),
          });
        }
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
    if (!database || database._isMock || !currentUser) {
      setActiveUsers([]);
      return;
    }

    const presenceRef = ref(database, 'presence');
    
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const presenceData = snapshot.val();
      if (presenceData) {
        const users = Object.entries(presenceData)
          .filter(([uid, data]) => data && data.online && uid !== currentUser?.uid)
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
    if (!currentUser || !database || database._isMock) return;

    // Throttle cursor updates (update max once per 100ms)
    const cursorRef = ref(database, `cursors/${pageId}/${currentUser.uid}`);
    set(cursorRef, {
      x,
      y,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
    });
  }, [currentUser]);

  // Monitor cursors for a specific page
  const usePageCursors = useCallback((pageId) => {
    const [pageCursors, setPageCursors] = useState({});

    useEffect(() => {
      if (!database || database._isMock || !currentUser || !pageId) {
        setPageCursors({});
        return;
      }

      const cursorsRef = ref(database, `cursors/${pageId}`);
      
      const unsubscribe = onValue(cursorsRef, (snapshot) => {
        const cursorsData = snapshot.val();
        if (cursorsData) {
          const filteredCursors = {};
          Object.entries(cursorsData).forEach(([uid, cursor]) => {
            if (uid !== currentUser.uid && cursor) {
              filteredCursors[uid] = cursor;
            }
          });
          setPageCursors(filteredCursors);
        }
      });

      return () => {
        off(cursorsRef);
      };
    }, [currentUser, pageId]);

    return pageCursors;
  }, [currentUser]);

  // Broadcast typing status
  const broadcastTyping = useCallback((pageId, isTyping) => {
    if (!currentUser || !database || database._isMock) return;

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
    if (!currentUser || !database || database._isMock) return;

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
    usePageCursors,
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
    // Return mock values if context is not available
    return {
      activeUsers: [],
      cursors: {},
      presence: {},
      isConnected: false,
      updateCursor: () => {},
      usePageCursors: () => ({}),
      broadcastTyping: () => {},
      sendMessage: () => {},
    };
  }
  return context;
};

export default CollaborationContext;
