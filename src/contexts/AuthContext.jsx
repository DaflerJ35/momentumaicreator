import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, database } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { ref, update, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle user authentication state changes
  useEffect(() => {
    // Check if auth is a mock object
    if (auth && auth._isMock) {
      // This is our mock auth object - use its method directly
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else if (auth) {
      // Real Firebase auth object - use Firebase's onAuthStateChanged
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // No auth available at all
      setCurrentUser(null);
      setLoading(false);
      return () => {};
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Check if auth is a mock object
      if (auth && auth._isMock) {
        // Mock auth - just navigate
        navigate('/');
      } else if (auth) {
        // Real Firebase auth
        await firebaseSignOut(auth);
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [navigate]);

  // Update user profile (display name, photo URL)
  const updateProfile = useCallback(async (profileData) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    if (!database) {
      throw new Error('Database is not configured');
    }

    try {
      // Update Firebase Auth profile
      await firebaseUpdateProfile(currentUser, profileData);

      // Update Realtime Database profile
      const userRef = ref(database, `users/${currentUser.uid}`);
      await update(userRef, {
        displayName: profileData.displayName || currentUser.displayName,
        photoURL: profileData.photoURL || currentUser.photoURL,
        updatedAt: Date.now(),
      });

      // Refresh current user state
      setCurrentUser({ ...currentUser, ...profileData });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [currentUser, database]);

  // Update email address
  const updateEmail = useCallback(async (newEmail, currentPassword) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    if (!database) {
      throw new Error('Database is not configured');
    }

    try {
      // Reauthenticate user before sensitive operation
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Update email in Firebase Auth
      await firebaseUpdateEmail(currentUser, newEmail);

      // Update email in Realtime Database
      const userRef = ref(database, `users/${currentUser.uid}`);
      await update(userRef, {
        email: newEmail,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  }, [currentUser, database]);

  // Update password
  const updatePassword = useCallback(async (newPassword, currentPassword) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Reauthenticate user before sensitive operation
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Update password in Firebase Auth
      await firebaseUpdatePassword(currentUser, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }, [currentUser]);

  // Delete user account
  const deleteAccount = useCallback(async (currentPassword) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    if (!database) {
      throw new Error('Database is not configured');
    }

    try {
      // Reauthenticate user before deletion
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          currentPassword
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Delete user data from Realtime Database
      const userRef = ref(database, `users/${currentUser.uid}`);
      await remove(userRef);

      // Delete user from Firebase Auth
      await firebaseDeleteUser(currentUser);

      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }, [currentUser, navigate, database]);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    logout,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
