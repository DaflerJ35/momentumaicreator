/**
 * Shared Motion Variants
 * 
 * Centralized motion animations with reduced motion support.
 * All animations respect prefers-reduced-motion media query.
 */

/**
 * Check if user prefers reduced motion
 * Returns true if user has reduced motion preference
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on motion preference
 * @param {number} duration - Base duration in seconds
 * @returns {number} Adjusted duration (0 if reduced motion, otherwise base duration)
 */
export const getMotionDuration = (duration) => {
  return prefersReducedMotion() ? 0 : duration;
};

/**
 * Fade in animation variant
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: prefersReducedMotion() ? 0 : 0.5,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: prefersReducedMotion() ? 0 : 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide up animation variant
 */
export const slideUp = {
  initial: { 
    opacity: 0, 
    y: prefersReducedMotion() ? 0 : 20 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: prefersReducedMotion() ? 0 : 0.5,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: prefersReducedMotion() ? 0 : -20,
    transition: { 
      duration: prefersReducedMotion() ? 0 : 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Scale in animation variant
 */
export const scaleIn = {
  initial: { 
    opacity: 0, 
    scale: prefersReducedMotion() ? 1 : 0.9 
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: prefersReducedMotion() ? 0 : 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: prefersReducedMotion() ? 1 : 0.9,
    transition: { 
      duration: prefersReducedMotion() ? 0 : 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Float animation variant (for background elements)
 */
export const float = {
  animate: {
    y: prefersReducedMotion() ? [0, 0] : [0, -20, 0],
    x: prefersReducedMotion() ? [0, 0] : [0, 10, 0],
    transition: {
      duration: prefersReducedMotion() ? 0 : 6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Pulse animation variant
 */
export const pulse = {
  animate: {
    scale: prefersReducedMotion() ? [1, 1] : [1, 1.05, 1],
    opacity: prefersReducedMotion() ? [1, 1] : [1, 0.8, 1],
    transition: {
      duration: prefersReducedMotion() ? 0 : 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

/**
 * Gradient orb animation (for background)
 */
export const gradientOrb = (duration = 20, offset = { x: 0, y: 0 }) => {
  if (prefersReducedMotion()) {
    return {
      animate: {
        x: 0,
        y: 0,
        scale: 1
      }
    };
  }

  return {
    animate: {
      x: [offset.x, offset.x + 100, offset.x],
      y: [offset.y, offset.y + 100, offset.y],
      scale: [1, 1.2, 1],
      transition: {
        duration: duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };
};

/**
 * Stagger children animation
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion() ? 0 : 0.1,
      delayChildren: prefersReducedMotion() ? 0 : 0.1
    }
  }
};

/**
 * Get particle count based on device and motion preference
 * @param {number} baseCount - Base particle count
 * @returns {number} Adjusted particle count
 */
export const getParticleCount = (baseCount) => {
  if (prefersReducedMotion()) {
    return Math.floor(baseCount * 0.3); // Reduce by 70% for reduced motion
  }
  
  // Reduce on mobile devices
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return Math.floor(baseCount * 0.5); // Reduce by 50% on mobile
  }
  
  return baseCount;
};

/**
 * Get blur intensity based on device and motion preference
 * @param {string} baseBlur - Base blur value (e.g., 'blur-3xl')
 * @returns {string} Adjusted blur value
 */
export const getBlurIntensity = (baseBlur) => {
  if (prefersReducedMotion()) {
    return 'blur-none'; // No blur for reduced motion
  }
  
  // Reduce blur on mobile for better performance
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    // Map blur values to lighter versions
    const blurMap = {
      'blur-3xl': 'blur-xl',
      'blur-2xl': 'blur-lg',
      'blur-xl': 'blur-md',
      'blur-lg': 'blur-sm',
    };
    return blurMap[baseBlur] || baseBlur;
  }
  
  return baseBlur;
};

/**
 * Motion-safe wrapper for framer-motion components
 * Disables animations if user prefers reduced motion
 */
export const motionSafe = {
  animate: (animations) => {
    if (prefersReducedMotion()) {
      return {};
    }
    return animations;
  },
  transition: (transitions) => {
    if (prefersReducedMotion()) {
      return { duration: 0 };
    }
    return transitions;
  }
};

