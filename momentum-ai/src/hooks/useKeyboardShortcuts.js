import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const altModifier = e.altKey;
      const shiftModifier = e.shiftKey;

      // Build key combination string
      const parts = [];
      if (modifier) parts.push(isMac ? 'meta' : 'ctrl');
      if (altModifier) parts.push('alt');
      if (shiftModifier) parts.push('shift');
      parts.push(key);
      const combination = parts.join('+');

      // Find matching shortcut
      const shortcut = shortcuts.find(s => {
        const shortcutKey = s.key.toLowerCase();
        return shortcutKey === combination || shortcutKey === key;
      });

      if (shortcut) {
        // Check if input is focused (don't trigger shortcuts in inputs)
        const activeElement = document.activeElement;
        const isInputFocused = 
          activeElement?.tagName === 'INPUT' ||
          activeElement?.tagName === 'TEXTAREA' ||
          activeElement?.contentEditable === 'true';

        if (!shortcut.allowInInputs && isInputFocused) {
          return;
        }

        e.preventDefault();
        shortcut.action(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;

