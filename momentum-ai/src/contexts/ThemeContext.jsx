import { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  cosmic: {
    name: 'Cosmic',
    colors: {
      primary: 'hsl(var(--brand-purple))',
      secondary: 'hsl(var(--brand-cyan))',
      accent: 'hsl(var(--brand-pink))',
      background: 'hsl(240, 10%, 5%)',
      surface: 'rgba(30, 41, 59, 0.5)',
    },
    gradients: {
      primary: 'from-brand-cyan to-brand-purple',
      secondary: 'from-brand-purple to-brand-pink',
      accent: 'from-brand-pink to-brand-cyan',
    },
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: 'hsl(200, 100%, 50%)',
      secondary: 'hsl(180, 100%, 40%)',
      accent: 'hsl(210, 100%, 60%)',
      background: 'hsl(220, 40%, 10%)',
      surface: 'rgba(30, 58, 138, 0.5)',
    },
    gradients: {
      primary: 'from-blue-500 to-cyan-500',
      secondary: 'from-cyan-500 to-teal-500',
      accent: 'from-teal-500 to-blue-500',
    },
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: 'hsl(0, 100%, 65%)',
      secondary: 'hsl(30, 100%, 60%)',
      accent: 'hsl(340, 100%, 70%)',
      background: 'hsl(240, 20%, 8%)',
      surface: 'rgba(139, 92, 246, 0.5)',
    },
    gradients: {
      primary: 'from-orange-500 to-red-500',
      secondary: 'from-pink-500 to-purple-500',
      accent: 'from-red-500 to-pink-500',
    },
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: 'hsl(142, 76%, 36%)',
      secondary: 'hsl(158, 64%, 52%)',
      accent: 'hsl(172, 66%, 50%)',
      background: 'hsl(240, 15%, 8%)',
      surface: 'rgba(20, 83, 45, 0.5)',
    },
    gradients: {
      primary: 'from-green-500 to-emerald-500',
      secondary: 'from-emerald-500 to-teal-500',
      accent: 'from-teal-500 to-green-500',
    },
  },
  neon: {
    name: 'Neon',
    colors: {
      primary: 'hsl(320, 100%, 50%)',
      secondary: 'hsl(280, 100%, 60%)',
      accent: 'hsl(200, 100%, 50%)',
      background: 'hsl(240, 10%, 3%)',
      surface: 'rgba(139, 92, 246, 0.3)',
    },
    gradients: {
      primary: 'from-pink-500 via-purple-500 to-cyan-500',
      secondary: 'from-purple-500 to-pink-500',
      accent: 'from-cyan-500 to-purple-500',
    },
  },
  minimal: {
    name: 'Minimal',
    colors: {
      primary: 'hsl(0, 0%, 100%)',
      secondary: 'hsl(0, 0%, 80%)',
      accent: 'hsl(0, 0%, 60%)',
      background: 'hsl(0, 0%, 10%)',
      surface: 'rgba(255, 255, 255, 0.1)',
    },
    gradients: {
      primary: 'from-white to-gray-300',
      secondary: 'from-gray-300 to-gray-500',
      accent: 'from-gray-500 to-white',
    },
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved && themes[saved] ? saved : 'cosmic';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
  }, [currentTheme]);

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Update CSS variables for gradients
    root.style.setProperty('--theme-name', themeName);
  };

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    currentTheme,
    themes,
    theme: themes[currentTheme],
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;

