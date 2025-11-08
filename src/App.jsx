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
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check if auth modal should be shown based on location state
  useEffect(() => {
    if (location.state?.showAuth) {
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
        </main>
      </div>
    </div>
  );

  return (
    <div className="app-container relative">
      {!isPublicRoute && (
        <>
          <AnimatedBackground />
          <ParticleBackground particleCount={30} />
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
          </motion.div>
        </AnimatePresence>
      ) : (
        // Protected routes with app shell
        <AppShell>
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
  );
}

function ProtectedRoute({ children, user }) {
  // Always render children - let individual pages handle auth requirements
  // This prevents redirect loops and allows pages to show content with auth prompts
  return children;
}

// Main App component (Router is provided in main.jsx)
const App = () => <AppContent />;

export default App;
