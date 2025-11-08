import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Command, 
  Home, 
  Brain, 
  Copy, 
  BarChart3, 
  Settings, 
  User,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { routes } from '../config/routes';
import { useAuth } from '../contexts/AuthContext';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Build searchable items
  const items = useMemo(() => {
    if (!routes || !Array.isArray(routes)) {
      return [];
    }
    
    const navItems = routes
      .filter(route => route && route.showInNav && route.title)
      .map(route => ({
        id: route.path,
        title: route.title,
        subtitle: route.path,
        icon: route.icon || Home,
        category: 'Navigation',
        action: () => {
          navigate(route.path);
          setIsOpen(false);
        },
      }));

    const actions = [
      {
        id: 'dashboard',
        title: 'Go to Dashboard',
        subtitle: '/dashboard',
        icon: Home,
        category: 'Actions',
        action: () => {
          navigate('/dashboard');
          setIsOpen(false);
        },
      },
      {
        id: 'settings',
        title: 'Open Settings',
        subtitle: '/settings',
        icon: Settings,
        category: 'Actions',
        action: () => {
          navigate('/settings');
          setIsOpen(false);
        },
      },
      {
        id: 'profile',
        title: 'View Profile',
        subtitle: '/profile',
        icon: User,
        category: 'Actions',
        action: () => {
          navigate('/profile');
          setIsOpen(false);
        },
      },
    ];

    return [...navItems, ...actions];
  }, [navigate]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // CMD+K or CTRL+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('command-palette-search');
      setTimeout(() => input?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 top-20 mx-auto max-w-2xl z-50"
          >
            <div className="glass-morphism border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  id="command-palette-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-lg"
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                    ESC
                  </kbd>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Sparkles className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-slate-400 text-lg font-medium">No results found</p>
                    <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category} className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="space-y-1">
                        {categoryItems.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <motion.button
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={item.action}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-[hsl(200,100%,50%)]/10 hover:to-[hsl(280,85%,60%)]/10 text-left group transition-all"
                            >
                              <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-gradient-to-br group-hover:from-[hsl(200,100%,50%)] group-hover:to-[hsl(280,85%,60%)] transition-all">
                                <Icon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-medium group-hover:text-[hsl(200,100%,50%)] transition-colors">
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-500">{item.subtitle}</div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700">
                      ESC
                    </kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Press <kbd className="px-2 py-1 bg-slate-800/50 rounded border border-slate-700">⌘K</kbd> to open
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;

