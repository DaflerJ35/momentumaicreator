/**
 * Motion Variants for Framer Motion
 * Centralized animation definitions for consistent motion
 */

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

export const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const hoverScale = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: 'easeOut' as const,
  },
};

export const tapScale = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: 'easeOut' as const,
  },
};

// Reduced motion variants
export const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get appropriate variants based on user preference
export const getMotionVariants = (variants: typeof pageVariants) => {
  if (prefersReducedMotion()) {
    return reducedMotionVariants;
  }
  return variants;
};

