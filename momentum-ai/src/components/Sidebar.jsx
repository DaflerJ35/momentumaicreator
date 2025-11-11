import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Brain,
  Copy,
  Wand2,
  Rocket,
  LayoutTemplate,
  Calendar,
  LineChart,
  History,
  TestTube2,
  Zap,
  Layers,
  Users,
  Store,
  Gift,
  CreditCard,
  Settings as SettingsIcon,
  X as XMarkIcon,
  LogOut as LogoutIcon,
  User as UserIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { FloatingElement } from './animations/FloatingElements';

// Group routes by section
const groupRoutesBySection = (routes) => {
  const sections = {
    main: {
      title: 'MAIN',
      items: [],
      icon: Home
    },
    ai: {
      title: 'AI TOOLS',
      items: [],
      icon: Brain
    },
    content: {
      title: 'CONTENT SUITE',
      items: [],
      icon: Copy
    },
    analytics: {
      title: 'ANALYTICS',
      items: [],
      icon: LineChart
    },
    advanced: {
      title: 'ADVANCED TOOLS',
      items: [],
      icon: Zap
    },
    growth: {
      title: 'GROWTH',
      items: [],
      icon: Rocket
    },
    account: {
      title: 'ACCOUNT',
      items: [],
      icon: UserIcon
    }
  };

  routes.forEach(route => {
    if (route.showInNav && route.path !== '/') {
      const category = route.category || route.path.split('/')[1] || 'main';
      if (sections[category]) {
        sections[category].items.push(route);
      } else {
        sections.main.items.push(route);
      }
    }
  });

  return Object.entries(sections)
    .filter(([_, section]) => section.items.length > 0)
    .map(([id, section]) => ({ id, ...section }));
};

const NavItem = ({ item, isCollapsed, isActive, onClick }) => {
  if (!item.showInNav) return null;
  
  const Icon = item.icon || Home;
  
  return (
    <motion.div
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        to={item.path}
        onClick={onClick}
        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
          isActive
            ? 'bg-gradient-to-r from-[hsl(200,100%,50%)]/20 to-[hsl(280,85%,60%)]/20 border-l-4 border-[hsl(200,100%,50%)] text-white shadow-lg shadow-[hsl(200,100%,50%)]/20'
            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
        }`}
        title={item.title}
      >
        <Icon
          className={`flex-shrink-0 ${
            isActive 
              ? 'text-emerald-400' 
              : 'text-slate-400 group-hover:text-emerald-400'
          } mr-3 h-5 w-5`}
          aria-hidden="true"
        />
        <span className="truncate">{item.title}</span>
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute right-4 w-1.5 h-6 bg-emerald-500 rounded-full"
            initial={false}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}
          />
        )}
      </Link>
    </motion.div>
  );
};

const Sidebar = ({ isOpen, onToggle, routes = [], onWidthChange, forceHover, onHoverChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  
  // Sync internal hover state with external forceHover prop
  useEffect(() => {
    if (forceHover !== undefined) {
      setIsHovered(forceHover);
      if (onHoverChange) {
        onHoverChange(forceHover);
      }
    }
  }, [forceHover, onHoverChange]);
  
  // Filter routes based on authentication status
  // Only show protected routes when user is authenticated
  // Always show public routes (protected: false or undefined)
  const filteredRoutes = routes.filter(route => {
    // If route is protected, only show if user is authenticated
    if (route.protected === true) {
      return !!currentUser;
    }
    // Show public routes regardless of authentication status
    return true;
  });
  
  // Ensure all routes have required properties before grouping
  const processedRoutes = filteredRoutes.map(route => ({
    ...route,
    icon: route.icon || Home // Fallback to Home icon if none provided
  }));
  
  const sections = groupRoutesBySection(processedRoutes);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? '' : sectionId);
  };

  // Calculate sidebar width based on hover state - hover menu design
  // Completely hidden by default (0px), expands to 256px on hover
  useEffect(() => {
    const calculateWidth = () => {
      // On mobile, when sidebar is closed, width is 0
      if (window.innerWidth < 768 && !isOpen) {
        return 0;
      }
      // When hovered, show full sidebar (256px)
      if (isHovered) return 256;
      // When not hovered, completely hidden (0px) - content is centered
      return 0;
    };

    const width = calculateWidth();
    if (onWidthChange) {
      onWidthChange(width);
    }
  }, [isOpen, isHovered, onWidthChange]);

  // Calculate current sidebar width for rendering
  const getSidebarWidth = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && !isOpen) {
      return 0;
    }
    // Hover menu: 0px when hidden, 256px on hover
    return isHovered ? 256 : 0;
  };

  const sidebarWidth = getSidebarWidth();

  return (
    <>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Hover Menu (completely hidden until hover) */}
      <motion.div
        initial={false}
        animate={{
          width: `${sidebarWidth}px`,
          opacity: isHovered ? 1 : 0,
        }}
        onMouseEnter={() => {
          // Expand when mouse enters sidebar area (desktop only)
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            setIsHovered(true);
            if (onHoverChange) onHoverChange(true);
          }
        }}
        onMouseLeave={() => {
          // Collapse when mouse leaves sidebar area
          setIsHovered(false);
          if (onHoverChange) onHoverChange(false);
        }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900/98 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out ${
          isHovered ? 'border-r border-slate-700' : 'border-r border-transparent'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          // Ensure sidebar overlays content, doesn't push it
          position: 'fixed',
          // Add shadow when expanded
          boxShadow: isHovered ? '4px 0 24px rgba(0, 0, 0, 0.5)' : 'none',
          // Allow pointer events only when hovered or when very thin (for hover trigger)
          pointerEvents: isHovered || sidebarWidth > 0 ? 'auto' : 'none',
          // Make sure it's always on the left edge
          left: 0,
        }}
      >
        {/* Hover trigger area - small strip on left edge when hidden */}
        {!isHovered && sidebarWidth === 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-2 h-full" />
        )}
        
        {/* Full sidebar content - only visible when hovered */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden w-full"
            >
            {/* Logo and close button */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 flex-shrink-0">
              <Link to="/" className="flex items-center gap-2 flex-1 min-w-0">
                <img 
                  src="/momentum-logo.png" 
                  alt="Momentum AI" 
                  className="h-8 w-8 object-contain flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 whitespace-nowrap">
                  Momentum AI
                </span>
              </Link>
              
              <button
                onClick={onToggle}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto overflow-x-hidden">
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <h3 className="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center whitespace-nowrap">
                    <section.icon className="h-3.5 w-3.5 mr-2 text-slate-500 flex-shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </h3>
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon || Home;
                      
                      return (
                        <NavItem
                          key={item.path}
                          item={{
                            ...item,
                            icon: Icon,
                            title: item.title || item.path.split('/').pop()
                          }}
                          isCollapsed={false}
                          isActive={isActive}
                          onClick={() => {}}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* User section */}
            <div className="border-t border-slate-800 p-4 flex-shrink-0">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">
                    Account
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/auth/signin"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Sign in
                  </Link>
                  <p className="text-xs text-center text-slate-400">
                    New user?{' '}
                    <Link
                      to="/auth/signup"
                      className="font-medium text-emerald-400 hover:text-emerald-300"
                    >
                      Create account
                    </Link>
                  </p>
                </div>
              )}
            </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default Sidebar;
