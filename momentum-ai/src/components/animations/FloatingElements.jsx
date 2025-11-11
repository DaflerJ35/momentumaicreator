import { motion } from 'framer-motion';

export const FloatingElement = ({ children, duration = 3, delay = 0 }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

export const PulsingElement = ({ children, scale = 1.1, duration = 2 }) => {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export const RotatingElement = ({ children, duration = 20 }) => {
  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;

