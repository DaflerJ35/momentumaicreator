import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { AlertCircle, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { isFirebaseReady } from '../../lib/firebase';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithGithub, signInWithLinkedIn, signInWithApple } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Sanitize email input
      const sanitizedEmail = formData.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        setError('Please enter a valid email address');
        toast.error('Invalid email address');
        setIsLoading(false);
        return;
      }
      
      await signIn(sanitizedEmail, formData.password);
      toast.success('Successfully signed in!');
      navigate(from, { replace: true });
    } catch (err) {
      // Enhanced error handling with better user feedback
      console.error('Sign in error:', err);
      
      // Handle different error types
      if (err.message) {
        // Error from AuthContext (already user-friendly)
        setError(err.message);
        toast.error(err.message);
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
        toast.error('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Your account has been temporarily locked. Please try again later or reset your password.');
        toast.error('Account temporarily locked. Please try again later.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support for assistance.');
        toast.error('Account disabled. Please contact support.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
        toast.error('Network error. Please check your connection.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email and try again.');
        toast.error('Invalid email address');
      } else if (err.message && err.message.includes('Firebase is not configured')) {
        setError('Authentication service is not available. Please contact support.');
        toast.error('Service unavailable. Please contact support.');
      } else {
        // Generic error - don't expose internal details
        setError('Failed to sign in. Please check your credentials and try again. If the problem persists, contact support.');
        toast.error('Sign in failed. Please try again.');
      }
      
      // Log full error in development
      if (import.meta.env.DEV) {
        console.error('Full sign in error details:', {
          code: err.code,
          message: err.message,
          stack: err.stack,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (providerFn, providerName) => {
    if (!isFirebaseReady()) {
      setError('Firebase is not configured. Please contact support.');
      toast.error('Authentication service is not available');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await providerFn();
      toast.success(`Successfully signed in with ${providerName}!`);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(`${providerName} sign-in error:`, err);
      setError(err.message || `Failed to sign in with ${providerName}`);
      toast.error(`Failed to sign in with ${providerName}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your Momentum AI account</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-3 bg-rose-900/30 border border-rose-800/50 text-rose-400 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">
                    Password
                  </Label>
                  <Link 
                    to="/auth/forgot-password" 
                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800/50 text-slate-400">Or continue with</span>
            </div>
          </div>

          {!isFirebaseReady() && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800/50 text-yellow-400 rounded-lg text-sm">
              <p>Social login is not available. Firebase authentication is not configured.</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-11"
              onClick={() => handleProviderSignIn(signInWithGoogle, 'Google')}
              type="button"
              disabled={!isFirebaseReady() || isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-11"
              onClick={() => handleProviderSignIn(signInWithFacebook, 'Facebook')}
              type="button"
              disabled={!isFirebaseReady() || isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-11"
              onClick={() => handleProviderSignIn(signInWithTwitter, 'Twitter')}
              type="button"
              disabled={!isFirebaseReady() || isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="#1DA1F2" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Continue with Twitter
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-11"
              onClick={() => handleProviderSignIn(signInWithGithub, 'GitHub')}
              type="button"
              disabled={!isFirebaseReady() || isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
              Continue with GitHub
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-11"
              onClick={() => handleProviderSignIn(signInWithLinkedIn, 'LinkedIn')}
              type="button"
              disabled={!isFirebaseReady() || isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="#0077B5" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50 h-11"
              onClick={() => handleProviderSignIn(signInWithApple, 'Apple')}
              type="button"
              disabled={!isFirebaseReady() || isLoading}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link 
              to="/auth/signup" 
              className="font-medium text-emerald-400 hover:text-emerald-300"
              state={{ from: location.state?.from }}
            >
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>By continuing, you agree to our <a href="/terms" className="text-slate-400 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-slate-400 hover:underline">Privacy Policy</a>.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
