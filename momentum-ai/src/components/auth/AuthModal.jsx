import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { isFirebaseReady } from '../../lib/firebase';

// Helper to get/set redirect path using localStorage with TTL
const REDIRECT_KEY = 'redirectAfterLogin';
const REDIRECT_TTL = 30 * 60 * 1000; // 30 minutes

const getRedirectPath = () => {
  try {
    const stored = localStorage.getItem(REDIRECT_KEY);
    if (!stored) return null;
    const { path, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp > REDIRECT_TTL) {
      localStorage.removeItem(REDIRECT_KEY);
      return null;
    }
    return path;
  } catch {
    return null;
  }
};

const setRedirectPath = (path) => {
  try {
    localStorage.setItem(REDIRECT_KEY, JSON.stringify({
      path,
      timestamp: Date.now()
    }));
  } catch {
    // Fallback to sessionStorage if localStorage fails
    sessionStorage.setItem(REDIRECT_KEY, path);
  }
};

const clearRedirectPath = () => {
  localStorage.removeItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
};

export default function AuthModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const navigate = useNavigate();
  const { 
    signInWithGoogle, 
    signInWithFacebook, 
    signInWithTwitter, 
    signInWithGithub, 
    signInWithLinkedIn, 
    signInWithApple 
  } = useAuth();

  const handleProviderSignIn = async (providerFn, providerName) => {
    if (!isFirebaseReady()) {
      console.error('Firebase is not configured');
      return;
    }

    try {
      setLoadingProvider(providerName);
      setIsLoading(true);
      await providerFn();
      
      const redirectPath = getRedirectPath();
      clearRedirectPath();
      
      onClose();
      
      if (redirectPath && redirectPath !== '/') {
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(`Authentication error (${providerName}):`, error);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative z-10 w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-700 hover:text-white focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500">
              <span className="text-2xl font-bold text-white">M</span>
            </div>
            
            <DialogTitle className="mt-4 text-2xl font-bold text-white">Welcome to Momentum AI</DialogTitle>
            <p className="mt-2 text-slate-400">Sign in with your account to save your strategies and access all features</p>
            <p className="mt-1 text-xs text-slate-500">Note: Social sign-in is for your Momentum AI account. To connect platforms like Instagram or Twitter for posting, go to Platform Integrations.</p>
            
            {!isFirebaseReady() && (
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800/50 text-yellow-400 rounded-lg text-sm">
                <p>Social login is not available. Firebase authentication is not configured.</p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <ProviderButton
                provider="Google"
                icon={
                  <svg className="w-5 h-5" viewBox="0 0 21 20" fill="none">
                    <path d="M20.308 10.2303C20.308 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.308 13.2728 20.308 10.2303Z" fill="#4285F4"/>
                    <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.043 10.7056 16.043C8.09569 16.043 5.88496 14.283 5.091 11.9175H1.76562V14.4927C3.46022 17.8695 6.83487 20.0006 10.7019 20.0006Z" fill="#34A853"/>
                    <path d="M5.08857 11.9175C4.66969 10.6749 4.65847 9.33998 5.08185 8.09183V5.5166H1.76677C0.348584 8.33798 0.348584 11.678 1.76677 14.4994L5.08857 11.9175Z" fill="#FBBC04"/>
                    <path d="M10.7019 3.95805C12.3256 3.936 13.8785 4.58167 14.9989 5.75161L17.3916 3.36296C15.5834 1.60396 13.1841 0.65479 10.7056 0.666606C6.83487 0.666606 3.46022 2.79775 1.76562 6.1745L5.08242 8.75175C5.8726 6.37977 8.0881 4.60785 10.7019 3.95805Z" fill="#EA4335"/>
                  </svg>
                }
                onClick={() => handleProviderSignIn(signInWithGoogle, 'Google')}
                isLoading={isLoading && loadingProvider === 'Google'}
                disabled={!isFirebaseReady() || isLoading}
              />
              <ProviderButton
                provider="Facebook"
                icon={
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                }
                onClick={() => handleProviderSignIn(signInWithFacebook, 'Facebook')}
                isLoading={isLoading && loadingProvider === 'Facebook'}
                disabled={!isFirebaseReady() || isLoading}
              />
              <ProviderButton
                provider="Twitter"
                icon={
                  <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                }
                onClick={() => handleProviderSignIn(signInWithTwitter, 'Twitter')}
                isLoading={isLoading && loadingProvider === 'Twitter'}
                disabled={!isFirebaseReady() || isLoading}
              />
              <ProviderButton
                provider="GitHub"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                  </svg>
                }
                onClick={() => handleProviderSignIn(signInWithGithub, 'GitHub')}
                isLoading={isLoading && loadingProvider === 'GitHub'}
                disabled={!isFirebaseReady() || isLoading}
              />
              <ProviderButton
                provider="LinkedIn"
                icon={
                  <svg className="w-5 h-5" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                }
                onClick={() => handleProviderSignIn(signInWithLinkedIn, 'LinkedIn')}
                isLoading={isLoading && loadingProvider === 'LinkedIn'}
                disabled={!isFirebaseReady() || isLoading}
              />
              <ProviderButton
                provider="Apple"
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                }
                onClick={() => handleProviderSignIn(signInWithApple, 'Apple')}
                isLoading={isLoading && loadingProvider === 'Apple'}
                disabled={!isFirebaseReady() || isLoading}
              />
              
              <p className="mt-4 text-xs text-slate-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function ProviderButton({ provider, icon, onClick, isLoading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <svg className="mr-2 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </>
      ) : (
        <>
          <span className="mr-2">{icon}</span>
          Continue with {provider}
        </>
      )}
    </button>
  );
}

// Export helper functions for use in other components
export { getRedirectPath, setRedirectPath, clearRedirectPath };
