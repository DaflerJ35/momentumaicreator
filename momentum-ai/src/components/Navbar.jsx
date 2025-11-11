import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Bell, User, Menu, X, Sparkles } from 'lucide-react';
import { FloatingElement, PulsingElement } from './animations/FloatingElements';
import { ShimmerText } from './animations/ShimmerEffect';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationCenter from './NotificationCenter';

function Navbar({ user, onAuthClick, onMenuToggle }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Persist preference
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 transition-colors relative z-50 shadow-xl w-full"
    >
      <div className="flex items-center justify-between w-full" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onMenuToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </motion.button>
          <FloatingElement duration={3}>
            <div className="flex items-center gap-2">
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg blur-xl opacity-50"
                />
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/momentum-logo.png" 
                    alt="Momentum AI" 
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      // Fallback to gradient icon if logo not found
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.logo-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="logo-fallback hidden bg-gradient-to-r from-cyan-400 to-pink-500 p-2 rounded-lg absolute inset-0 items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <ShimmerText className="text-2xl font-bold">Momentum AI</ShimmerText>
            </div>
          </FloatingElement>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Switcher */}
          <ThemeSwitcher />
          
          {/* Dark mode toggle */}
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors relative"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div
                  key="sun"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-[hsl(200,100%,50%)]" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ opacity: 0, rotate: 180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -180 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5 text-slate-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <NotificationCenter />

          {/* User menu */}
          {user ? (
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-[hsl(200,100%,50%)]/50 cursor-pointer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
                whileHover={{
                  borderColor: 'hsl(200,100%,50%)',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                }}
                transition={{ duration: 0.2 }}
              />
              <span className="text-sm font-medium text-slate-300 hidden md:block">
                {user.displayName || user.email}
              </span>
            </motion.div>
          ) : (
            <motion.button
              onClick={onAuthClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-[hsl(200,100%,50%)] to-[hsl(280,85%,60%)] hover:from-[hsl(280,85%,60%)] hover:to-[hsl(320,90%,55%)] text-white rounded-lg font-medium shadow-lg hover:shadow-xl hover:shadow-[hsl(200,100%,50%)]/50 transition-all"
            >
              <User className="w-4 h-4 inline mr-2" />
              Sign In
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.object,
  onAuthClick: PropTypes.func.isRequired,
  onMenuToggle: PropTypes.func,
};

export default Navbar;
