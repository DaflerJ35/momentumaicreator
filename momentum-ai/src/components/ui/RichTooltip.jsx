import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

export const RichTooltip = ({ 
  content, 
  title, 
  children, 
  placement = 'top',
  delay = 200,
  maxWidth = '300px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = trigger.top + scrollY - tooltip.height - 8;
        left = trigger.left + scrollX + (trigger.width / 2) - (tooltip.width / 2);
        break;
      case 'bottom':
        top = trigger.bottom + scrollY + 8;
        left = trigger.left + scrollX + (trigger.width / 2) - (tooltip.width / 2);
        break;
      case 'left':
        top = trigger.top + scrollY + (trigger.height / 2) - (tooltip.height / 2);
        left = trigger.left + scrollX - tooltip.width - 8;
        break;
      case 'right':
        top = trigger.top + scrollY + (trigger.height / 2) - (tooltip.height / 2);
        left = trigger.right + scrollX + 8;
        break;
      default:
        top = trigger.top + scrollY - tooltip.height - 8;
        left = trigger.left + scrollX + (trigger.width / 2) - (tooltip.width / 2);
    }

    // Keep tooltip within viewport
    const padding = 8;
    if (top < scrollY + padding) top = scrollY + padding;
    if (left < padding) left = padding;
    if (left + tooltip.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltip.width - padding;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      setTimeout(updatePosition, 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 5 : placement === 'bottom' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 5 : placement === 'bottom' ? -5 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              left: `${position.left}px`,
              zIndex: 9999,
              maxWidth,
              pointerEvents: 'none',
            }}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="glass-morphism border border-white/20 rounded-lg p-4 shadow-2xl">
              {title && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-[hsl(200,100%,50%)]" />
                    <h4 className="font-semibold text-white text-sm">{title}</h4>
                  </div>
                </div>
              )}
              <div className="text-sm text-slate-300 leading-relaxed">
                {typeof content === 'string' ? (
                  <p>{content}</p>
                ) : (
                  content
                )}
              </div>
            </div>
            {/* Arrow */}
            <div
              className="absolute w-2 h-2 bg-slate-800 border-white/20 rotate-45"
              style={{
                [placement === 'top' ? 'bottom' : placement === 'bottom' ? 'top' : placement === 'left' ? 'right' : 'left']: '-4px',
                [placement === 'top' || placement === 'bottom' ? 'left' : 'top']: '50%',
                transform: placement === 'top' || placement === 'bottom' 
                  ? 'translateX(-50%)' 
                  : 'translateY(-50%)',
                borderRight: placement === 'left' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                borderBottom: placement === 'top' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                borderTop: placement === 'bottom' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                borderLeft: placement === 'right' ? 'none' : '1px solid rgba(255,255,255,0.2)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RichTooltip;

