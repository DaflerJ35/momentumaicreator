import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { getDatabase, ref, set, get, update } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

// Validate required Firebase environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !import.meta.env[envVar]
);

let app = null;
let auth = null;
let database = null;
let db = null;

// Only initialize Firebase if all required env vars are present
const isFirebaseConfigured = missingEnvVars.length === 0;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  };

  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  // In development, show a helpful warning but don't break the app
  console.warn(
    `⚠️ Firebase not configured: Missing environment variables: ${missingEnvVars.join(', ')}\n` +
    `The app will work, but authentication and database features will be disabled.\n` +
    `To enable Firebase, create a .env file with the required variables.`
  );
  
  // Create mock objects to prevent errors when Firebase is accessed
  // We need to create a proper mock that works with Firebase's onAuthStateChanged
  auth = {
    currentUser: null,
    _isMock: true, // Flag to identify mock objects
    onAuthStateChanged: (callback) => {
      // Call callback immediately with null user
      if (callback) {
        // Use setTimeout to ensure it's async
        setTimeout(() => callback(null), 0);
      }
      // Return unsubscribe function
      return () => {};
    },
    signOut: async () => {
      console.warn('Firebase is not configured. Cannot sign out.');
    },
  };
  
  database = null;
  db = null;
}

// Export auth, database, and db (they may be null or mock objects)
export { auth, database, db };

// Google Auth Provider will be created when needed

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set up your .env file with Firebase credentials.');
  }

  try {
    const googleProvider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Reference to user profile in Realtime Database
    const userRef = ref(database, `users/${user.uid}`);
    
    // Check if user profile already exists
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      // Create new user profile if it doesn't exist
      await set(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      });
    } else {
      // Update only lastLogin for existing users to preserve other data
      await update(userRef, {
        lastLogin: Date.now(),
      });
    }

    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  if (!isFirebaseConfigured) {
    console.warn('Firebase is not configured. Cannot sign out.');
    return;
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const isFirebaseReady = () => isFirebaseConfigured;

// Export logout as an alias for signOut for backward compatibility
export const logout = signOut;

export default app;
