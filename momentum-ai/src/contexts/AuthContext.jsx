import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, database } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { ref, update, remove, set, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithGoogle,
  signInWithFacebook,
  signInWithTwitter,
  signInWithGithub,
  signInWithLinkedIn,
  signInWithApple
} from '../lib/firebase';

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

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    if (!auth || auth._isMock) {
      throw new Error('Firebase is not configured. Please set up your .env file with Firebase credentials.');
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('Invalid email address');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = userCredential.user;

      // Update last login in database
      if (database) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          await update(userRef, {
            lastLogin: Date.now(),
          });
        } else {
          // Create user profile if it doesn't exist
          await set(userRef, {
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: Date.now(),
            lastLogin: Date.now(),
          });
        }
      }

      return user;
    } catch (error) {
      // Map Firebase errors to user-friendly messages (security: don't leak details)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('This account has been disabled. Please contact support.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again.');
      }
      // Generic error for security (don't leak internal details)
      if (import.meta.env.DEV) {
        console.error('Error signing in:', error);
      }
      throw new Error('Failed to sign in. Please try again.');
    }
  }, [database]);

  // Sign up with email and password
  const signUp = useCallback(async (email, password, displayName = '') => {
    if (!auth || auth._isMock) {
      throw new Error('Firebase is not configured. Please set up your .env file with Firebase credentials.');
    }

    // Client-side password validation (server-side validation should also exist)
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    // Sanitize display name
    const sanitizedDisplayName = displayName ? displayName.trim().slice(0, 100) : '';

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (sanitizedDisplayName) {
        await firebaseUpdateProfile(user, { displayName: sanitizedDisplayName });
      }

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in database
      if (database) {
        const userRef = ref(database, `users/${user.uid}`);
        await set(userRef, {
          email: user.email,
          displayName: sanitizedDisplayName || user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          emailVerified: false,
        });
      }

      return user;
    } catch (error) {
      // Don't expose Firebase error details to users
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check your email and try again.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled. Please contact support.');
      }
      // Generic error for security (don't leak internal details)
      if (import.meta.env.DEV) {
        console.error('Error signing up:', error);
      }
      throw new Error('Failed to create account. Please try again.');
    }
  }, [database]);

  // Sign in with Google
  const signInWithGoogleAuth = useCallback(async () => {
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }, []);

  // Sign in with Facebook
  const signInWithFacebookAuth = useCallback(async () => {
    try {
      const user = await signInWithFacebook();
      return user;
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      throw error;
    }
  }, []);

  // Sign in with Twitter
  const signInWithTwitterAuth = useCallback(async () => {
    try {
      const user = await signInWithTwitter();
      return user;
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
      throw error;
    }
  }, []);

  // Sign in with GitHub
  const signInWithGithubAuth = useCallback(async () => {
    try {
      const user = await signInWithGithub();
      return user;
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
      throw error;
    }
  }, []);

  // Sign in with LinkedIn
  const signInWithLinkedInAuth = useCallback(async () => {
    try {
      const user = await signInWithLinkedIn();
      return user;
    } catch (error) {
      console.error('Error signing in with LinkedIn:', error);
      throw error;
    }
  }, []);

  // Sign in with Apple
  const signInWithAppleAuth = useCallback(async () => {
    try {
      const user = await signInWithApple();
      return user;
    } catch (error) {
      console.error('Error signing in with Apple:', error);
      throw error;
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
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleAuth,
    signInWithFacebook: signInWithFacebookAuth,
    signInWithTwitter: signInWithTwitterAuth,
    signInWithGithub: signInWithGithubAuth,
    signInWithLinkedIn: signInWithLinkedInAuth,
    signInWithApple: signInWithAppleAuth,
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
