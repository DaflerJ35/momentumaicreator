import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} border-4 border-slate-700 border-t-[hsl(200,100%,50%)] rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export const PulseLoader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizes[size]} rounded-full bg-[hsl(200,100%,50%)]`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export const DotsLoader = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="h-2 w-2 rounded-full bg-[hsl(200,100%,50%)]"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;

