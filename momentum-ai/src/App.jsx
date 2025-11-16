import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { routes } from './config/routes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/auth/AuthModal';
import AnimatedBackground from './components/AnimatedBackground';
import ParticleBackground from './components/animations/ParticleBackground';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import ActiveUsersIndicator from './components/ActiveUsersIndicator';
import CursorTrackingWrapper from './components/CursorTrackingWrapper';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import AIConfigBanner from './components/AIConfigBanner';
import { ConfigHealthBanner } from './components/ui/ConfigHealthBanner';
import { useAI } from './contexts/AIContext';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import GlobalLoadingIndicator from './components/ui/GlobalLoadingIndicator';
import ConnectionStatus from './components/ConnectionStatus';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(80); // Default collapsed width
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();
  const { aiConfigError } = useAI();

  useEffect(() => {
    let unsubscribe;
    
    // Check if auth is a mock object (when Firebase env vars are missing)
    if (auth && auth._isMock) {
      // This is our mock auth object - use its method directly
      unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        setLoading(false);
        // Show onboarding for new users
        if (currentUser && !currentUser.onboardingCompleted) {
          setShowOnboarding(true);
        }
      });
    } else if (auth) {
      // Real Firebase auth object - use Firebase's onAuthStateChanged
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        
        // Check if user needs onboarding
        if (currentUser) {
          try {
            const { database: db } = await import('./lib/firebase');
            if (db) {
              const { ref, get } = await import('firebase/database');
              const userRef = ref(db, `users/${currentUser.uid}/onboarding`);
              const snapshot = await get(userRef);
              
              if (!snapshot.exists() || !snapshot.val()?.completed) {
                // Show onboarding for new users
                setShowOnboarding(true);
              }
            } else {
              // If database not available, show onboarding anyway
              setShowOnboarding(true);
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // Show onboarding by default if we can't check
            setShowOnboarding(true);
          }
        }
      });
    } else {
      // No auth available at all
      setUser(null);
      setLoading(false);
      unsubscribe = () => {};
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Check if auth modal should be shown based on location state or query param
  useEffect(() => {
    // Check for query parameter ?showAuth=1 (for cross-origin redirects)
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('showAuth') === '1') {
      setShowAuthModal(true);
      // Clear the query param from URL to avoid re-opening on refresh
      const newSearch = new URLSearchParams(location.search);
      newSearch.delete('showAuth');
      const newSearchString = newSearch.toString();
      const newUrl = newSearchString 
        ? `${location.pathname}?${newSearchString}`
        : location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (location.state?.showAuth) {
      // Also check for location state (for internal navigation)
      setShowAuthModal(true);
    }
  }, [location]);

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  // Handle body overflow when modal or sidebar is open
  useEffect(() => {
    if (sidebarOpen || showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen, showAuthModal]);

  // Listen for auth-required events from API client
  useEffect(() => {
    const handleAuthRequired = () => {
      setShowAuthModal(true);
    };
    
    window.addEventListener('auth-required', handleAuthRequired);
    return () => {
      window.removeEventListener('auth-required', handleAuthRequired);
    };
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // ALL routes require authentication - no free access
  // Only landing page (/), pricing, contact, and auth pages are accessible without auth
  const publicRoutes = routes.filter(route => 
    route.path === '/' || 
    route.path === '/pricing' || 
    route.path === '/contact' ||
    (route.path && route.path.startsWith('/auth/'))
  );
  const protectedRoutes = routes.filter(route => 
    route.path !== '/' && 
    route.path !== '/pricing' && 
    route.path !== '/contact' &&
    route.path !== '*' &&
    (!route.path || !route.path.startsWith('/auth/'))
  );

  // Check if the current route is public (only landing, pricing, contact, auth pages)
  const isPublicRoute = publicRoutes.some(route => {
    if (route.path === location.pathname) return true;
    if (route.path === '/') return false; // Don't match everything for root
    if (route.path && location.pathname.startsWith(route.path)) return true;
    return false;
  });

  // App shell layout for protected routes
  const AppShell = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarHovered, setSidebarHovered] = useState(false);
    
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
      <div className="flex h-screen relative overflow-hidden">
        <AnimatedBackground />
        <ParticleBackground particleCount={30} />
        {/* Left edge hover zone - invisible trigger area (12px wide for better UX) */}
        <div 
          className="fixed left-0 top-0 bottom-0 w-3 z-40 cursor-pointer"
          onMouseEnter={() => {
            if (!isMobile) {
              setSidebarHovered(true);
            }
          }}
          style={{ 
            // Invisible hover zone that triggers sidebar
            backgroundColor: 'transparent',
          }}
        />
        <Sidebar 
          user={user} 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          routes={protectedRoutes}
          onWidthChange={setSidebarWidth}
          forceHover={sidebarHovered}
          onHoverChange={(hovered) => {
            setSidebarHovered(hovered);
          }}
        />
        {/* Main content - centered, full width, sidebar overlays on hover */}
        <div 
          className="flex flex-col flex-1 overflow-hidden relative z-10 w-full"
        >
          <Navbar 
            user={user} 
            onAuthClick={() => setShowAuthModal(true)} 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-y-auto p-6 relative w-full" style={{ maxWidth: '1400px', margin: '0 auto', paddingLeft: 'clamp(1.5rem, 4vw, 3rem)', paddingRight: 'clamp(1.5rem, 4vw, 3rem)' }}>
            <CursorTrackingWrapper enableTracking={true}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <LoadingSpinner size="xl" />
                    </div>
                  }>
                    {children}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </CursorTrackingWrapper>
          </main>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="app-container relative">
        {/* Global Loading Indicator */}
        <GlobalLoadingIndicator />
        {/* Connection Status */}
        <ConnectionStatus />
        {/* Configuration Health Banner */}
        <ConfigHealthBanner />
        {/* AI Configuration Banner */}
        <AIConfigBanner error={aiConfigError} />
        
        {!isPublicRoute && (
          <>
            <AnimatedBackground />
            <ParticleBackground particleCount={30} />
            <CommandPalette />
            <ActiveUsersIndicator />
          </>
        )}
        {isPublicRoute ? (
          // Public routes without the app shell
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="relative z-10"
            >
              <ErrorBoundary>
                <Routes location={location}>
                  {publicRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Suspense fallback={
                          <div className="flex items-center justify-center min-h-screen">
                            <LoadingSpinner size="xl" />
                          </div>
                        }>
                          <route.element />
                        </Suspense>
                      }
                    />
                  ))}
                  {/* Catch-all for public routes */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        ) : (
          // Protected routes with app shell
          <AppShell>
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <Routes location={location}>
                  {protectedRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ProtectedRoute user={user}>
                          <route.element />
                        </ProtectedRoute>
                      }
                    />
                  ))}
                  {/* Catch-all for protected routes */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AnimatePresence>
            </ErrorBoundary>
          </AppShell>
        )}
        
        {/* Auth Modal - Rendered outside of routes */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={handleAuthModalClose}
          />
        )}
        
        {/* Onboarding Wizard - Show for new users */}
        {showOnboarding && user && (
          <OnboardingWizard
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={() => setShowOnboarding(false)}
          />
        )}
        
        {/* Toast notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </ErrorBoundary>
  );
}

function ProtectedRoute({ children, user }) {
  // Check if user is authenticated
  if (!user) {
    // Return Navigate element instead of calling navigate() to avoid side-effects during render
    return <Navigate to="/" replace state={{ showAuth: true }} />;
  }

  // Render children only when user is authenticated
  return children;
}

// Main App component (Router is provided in main.jsx)
const App = () => <AppContent />;

export default App;
