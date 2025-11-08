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
  // Use the provided icon or fall back to Home icon if none provided
  const Icon = item.icon || Home;
  
  return (
    <motion.div
      whileHover={{ x: isCollapsed ? 0 : 4 }}
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
        } ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? item.title : ''}
      >
      <Icon
        className={`flex-shrink-0 ${
          isActive 
            ? 'text-emerald-400' 
            : 'text-slate-400 group-hover:text-emerald-400'
        } ${isCollapsed ? 'h-5 w-5' : 'mr-3 h-5 w-5'}`}
        aria-hidden="true"
      />
      {!isCollapsed && (
        <span className="truncate">{item.title}</span>
      )}
      {isActive && !isCollapsed && (
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
  );
};

const Sidebar = ({ isOpen, onToggle, routes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  
  // Ensure all routes have required properties before grouping
  const processedRoutes = routes.map(route => ({
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
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

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

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isOpen ? '16rem' : isCollapsed ? '5rem' : '16rem',
        }}
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
            {!isCollapsed && (
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Momentum AI
                </span>
              </Link>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>
              
              <button
                onClick={onToggle}
                className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
            {sections.map((section) => (
              <div key={section.id} className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase flex items-center">
                    <section.icon className="h-3.5 w-3.5 mr-2 text-slate-500" />
                    {section.title}
                  </h3>
                )}
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon || HomeIcon;
                    
                    return (
                      <NavItem
                        key={item.path}
                        item={{
                          ...item,
                          icon: Icon,
                          title: item.title || item.path.split('/').pop()
                        }}
                        isCollapsed={isCollapsed}
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
          <div className="border-t border-slate-800 p-4">
            {currentUser ? (
              <div className={isCollapsed ? 'flex flex-col items-center' : 'space-y-2'}>
                {!isCollapsed && (
                  <div className="px-3 py-2 text-xs font-medium text-slate-500 uppercase">
                    Account
                  </div>
                )}
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
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;
