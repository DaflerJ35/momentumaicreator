import { motion } from 'framer-motion';

export const Shimmer = ({ className = '' }) => {
  return (
    <motion.div
      className={`absolute inset-0 -z-10 ${className}`}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        backgroundSize: '200% 100%',
      }}
    />
  );
};

export const ShimmerText = ({ children, className = '' }) => {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        background: 'linear-gradient(90deg, #fff, #3b82f6, #8b5cf6, #ec4899, #fff)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </motion.span>
  );
};

export default Shimmer;

