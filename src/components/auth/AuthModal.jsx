import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { signInWithGoogle } from '../../lib/firebase';

export default function AuthModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      
      // Retrieve the intended redirect path from sessionStorage
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      
      // Clear the stored path
      sessionStorage.removeItem('redirectAfterLogin');
      
      onClose();
      
      // Navigate to the intended path or default to dashboard
      if (redirectPath && redirectPath !== '/') {
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
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
            <p className="mt-2 text-slate-400">Sign in to save your strategies and access all features</p>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
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
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_13183_10121)">
                        <path d="M20.308 10.2303C20.308 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.308 13.2728 20.308 10.2303Z" fill="#4285F4"/>
                        <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.043 10.7056 16.043C8.09569 16.043 5.88496 14.283 5.091 11.9175H1.76562V14.4927C3.46022 17.8695 6.83487 20.0006 10.7019 20.0006Z" fill="#34A853"/>
                        <path d="M5.08857 11.9175C4.66969 10.6749 4.65847 9.33998 5.08185 8.09183V5.5166H1.76677C0.348584 8.33798 0.348584 11.678 1.76677 14.4994L5.08857 11.9175Z" fill="#FBBC04"/>
                        <path d="M10.7019 3.95805C12.3256 3.936 13.8785 4.58167 14.9989 5.75161L17.3916 3.36296C15.5834 1.60396 13.1841 0.65479 10.7056 0.666606C6.83487 0.666606 3.46022 2.79775 1.76562 6.1745L5.08242 8.75175C5.8726 6.37977 8.0881 4.60785 10.7019 3.95805Z" fill="#EA4335"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_13183_10121">
                          <rect width="20" height="20" fill="white" transform="translate(0.5)"/>
                        </clipPath>
                      </defs>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              
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
