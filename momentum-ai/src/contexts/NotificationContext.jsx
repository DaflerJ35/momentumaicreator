import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, set, serverTimestamp, off, push, remove, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useCollaboration } from './CollaborationContext';
import { toast } from 'sonner';

const NotificationContext = createContext(null);

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  MESSAGE: 'message',
  COLLABORATION: 'collaboration',
  SYSTEM: 'system',
};

// Notification priorities
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { activeUsers, isConnected } = useCollaboration();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const previousActiveUsersRef = useRef([]);

  // Listen for real-time notifications from Firebase
  useEffect(() => {
    if (!currentUser || !database || database._isMock) {
      return;
    }

    const notificationsRef = ref(database, `notifications/${currentUser.uid}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notificationsData = snapshot.val();
      if (notificationsData) {
        const notificationsList = Object.entries(notificationsData)
          .map(([id, notification]) => ({
            id,
            ...notification,
            timestamp: notification.timestamp || Date.now(),
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        setNotifications(notificationsList);
        
        // Count unread notifications
        const unread = notificationsList.filter(n => !n.read).length;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => {
      off(notificationsRef);
    };
  }, [currentUser]);

  // Monitor active users for join/leave notifications
  useEffect(() => {
    if (!currentUser || !isConnected) return;

    const previousUsers = previousActiveUsersRef.current;
    const currentUsers = activeUsers || [];

    // Find new users (joined)
    const newUsers = currentUsers.filter(
      user => !previousUsers.find(pu => pu.uid === user.uid)
    );

    // Find users who left
    const leftUsers = previousUsers.filter(
      user => !currentUsers.find(cu => cu.uid === user.uid)
    );

    // Create notifications for new users
    newUsers.forEach(user => {
      if (user.uid !== currentUser.uid) {
        createNotification({
          type: NOTIFICATION_TYPES.USER_JOINED,
          title: 'User Joined',
          message: `${user.name || user.userName || 'A user'} joined the session`,
          priority: NOTIFICATION_PRIORITY.LOW,
          data: { userId: user.uid, userName: user.name || user.userName },
        });
      }
    });

    // Create notifications for users who left
    leftUsers.forEach(user => {
      createNotification({
        type: NOTIFICATION_TYPES.USER_LEFT,
        title: 'User Left',
        message: `${user.name || user.userName || 'A user'} left the session`,
        priority: NOTIFICATION_PRIORITY.LOW,
        data: { userId: user.uid, userName: user.name || user.userName },
      });
    });

    previousActiveUsersRef.current = currentUsers;
  }, [activeUsers, currentUser, isConnected]);

  // Create a new notification
  const createNotification = useCallback(
    async (notification) => {
      if (!currentUser || !database || database._isMock) {
        // Fallback to toast if Firebase is not available
        toast[notification.type]?.(
          notification.title,
          { description: notification.message }
        ) || toast.info(notification.title, { description: notification.message });
        return;
      }

      try {
        const notificationRef = ref(database, `notifications/${currentUser.uid}`);
        const newNotificationRef = push(notificationRef);

        await set(newNotificationRef, {
          ...notification,
          timestamp: serverTimestamp(),
          read: false,
          createdAt: Date.now(),
        });

        // Show toast for high priority notifications
        if (notification.priority === NOTIFICATION_PRIORITY.HIGH || 
            notification.priority === NOTIFICATION_PRIORITY.URGENT) {
          toast[notification.type]?.(
            notification.title,
            { description: notification.message, duration: 5000 }
          ) || toast.info(notification.title, { description: notification.message });
        }
      } catch (error) {
        console.error('Error creating notification:', error);
        // Fallback to toast
        toast[notification.type]?.(
          notification.title,
          { description: notification.message }
        ) || toast.info(notification.title, { description: notification.message });
      }
    },
    [currentUser]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!currentUser || !database || database._isMock) {
        // Update local state if Firebase is not available
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        return;
      }

      try {
        const notificationRef = ref(
          database,
          `notifications/${currentUser.uid}/${notificationId}`
        );
        await set(notificationRef, {
          ...notifications.find(n => n.id === notificationId),
          read: true,
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },
    [currentUser, notifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!currentUser || !database || database._isMock) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return;
    }

    try {
      const notificationsRef = ref(database, `notifications/${currentUser.uid}`);
      
      // Get current notifications (one-time read)
      const snapshot = await get(notificationsRef);
      const notificationsData = snapshot.val();

      if (notificationsData) {
        // Update all notifications to be marked as read
        const updates = Object.entries(notificationsData).map(([id, notification]) => {
          const notificationRef = ref(
            database,
            `notifications/${currentUser.uid}/${id}`
          );
          return set(notificationRef, { ...notification, read: true });
        });
        await Promise.all(updates);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback to local state update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, [currentUser]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!currentUser || !database || database._isMock) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return;
      }

      try {
        const notificationRef = ref(
          database,
          `notifications/${currentUser.uid}/${notificationId}`
        );
        await remove(notificationRef);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    [currentUser]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    if (!currentUser || !database || database._isMock) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const notificationsRef = ref(database, `notifications/${currentUser.uid}`);
      await remove(notificationsRef);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }, [currentUser]);

  // Send notification to user
  const sendNotificationToUser = useCallback(
    async (userId, notification) => {
      if (!database || database._isMock) {
        return;
      }

      try {
        const notificationRef = ref(database, `notifications/${userId}`);
        const newNotificationRef = push(notificationRef);
        await set(newNotificationRef, {
          ...notification,
          timestamp: serverTimestamp(),
          read: false,
          createdAt: Date.now(),
        });
      } catch (error) {
        console.error('Error sending notification to user:', error);
      }
    },
    []
  );

  const value = {
    notifications,
    unreadCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotificationToUser,
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITY,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return mock values if context is not available
    return {
      notifications: [],
      unreadCount: 0,
      isNotificationCenterOpen: false,
      setIsNotificationCenterOpen: () => {},
      createNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      clearAllNotifications: () => {},
      sendNotificationToUser: () => {},
      NOTIFICATION_TYPES,
      NOTIFICATION_PRIORITY,
    };
  }
  return context;
};

export default NotificationContext;

