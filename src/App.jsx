import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { routes } from './config/routes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/auth/AuthModal';
import AnimatedBackground from './components/AnimatedBackground';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';

// Premium loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen relative z-20">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500/20 border-t-emerald-500 border-r-cyan-500"></div>
      <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl"></div>
    </div>
  </div>
);

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
  // Root route (/) should use app shell (treated as protected route)
  const isPublicRoute = location.pathname !== '/' && publicRoutes.some(route => 
    route.path === location.pathname || 
    (route.path !== '/' && location.pathname.startsWith(route.path))
  );

  // App shell layout for protected routes
  const AppShell = ({ children }) => (
    <div className="flex h-screen relative overflow-hidden">
      <AnimatedBackground />
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
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );

  return (
    <div className="app-container relative">
      {!isPublicRoute && <AnimatedBackground />}
      {isPublicRoute ? (
        // Public routes without the app shell
        <div className="relative z-10">
          <Routes>
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <route.element />
                  </Suspense>
                }
              />
            ))}
            {/* Catch-all for public routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      ) : (
        // Protected routes with app shell
        <AppShell>
          <Routes>
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
