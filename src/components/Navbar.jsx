import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun, Bell, User } from 'lucide-react';

function Navbar({ user, onAuthClick }) {
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
    <nav className="bg-transparent border-b border-slate-700/30 px-6 py-4 transition-colors relative z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-200">
            Momentum AI
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          {user ? (
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full border-2 border-slate-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              <span className="text-sm font-medium text-slate-300">
                {user.displayName || user.email}
              </span>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600 transition-colors"
              aria-label="Sign in"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  onAuthClick: PropTypes.func.isRequired,
};

export default Navbar;
