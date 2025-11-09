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
import { useAI } from './contexts/AIContext';

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
      });
    } else if (auth) {
      // Real Firebase auth object - use Firebase's onAuthStateChanged
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  // Separate public and protected routes
  const publicRoutes = routes.filter(route => !route.protected);
  const protectedRoutes = routes.filter(route => route.protected);

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    route.path === location.pathname || 
    (route.path !== '/' && location.pathname.startsWith(route.path))
  );

  // App shell layout for protected routes
  const AppShell = ({ children }) => (
    <div className="flex h-screen relative overflow-hidden">
      <AnimatedBackground />
      <ParticleBackground particleCount={30} />
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
        routes={protectedRoutes}
      />
      <div className="flex flex-col flex-1 overflow-hidden relative z-10">
        <Navbar 
          user={user} 
          onAuthClick={() => setShowAuthModal(true)} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-6 relative">
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

  return (
    <ErrorBoundary>
      <div className="app-container relative">
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
