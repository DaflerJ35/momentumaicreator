import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { Button } from './ui/button';

const ThemeSwitcher = () => {
  const { currentTheme, themes, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="icon"
        className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
      >
        <Palette className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 w-64 glass-morphism border border-white/20 rounded-xl shadow-2xl p-4 z-50"
            >
              <h3 className="text-sm font-semibold text-white mb-3">Choose Theme</h3>
              <div className="space-y-2">
                {Object.entries(themes).map(([key, theme]) => (
                  <motion.button
                    key={key}
                    onClick={() => {
                      setTheme(key);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      currentTheme === key
                        ? 'bg-gradient-to-r from-[hsl(200,100%,50%)]/20 to-[hsl(280,85%,60%)]/20 border border-[hsl(200,100%,50%)]/50'
                        : 'bg-slate-800/50 border border-transparent hover:border-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.gradients.primary}`}
                      />
                      <span className="text-white text-sm font-medium">{theme.name}</span>
                    </div>
                    {currentTheme === key && (
                      <Check className="h-4 w-4 text-[hsl(200,100%,50%)]" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;

