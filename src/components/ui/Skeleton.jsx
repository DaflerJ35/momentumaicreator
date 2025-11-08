import { motion } from 'framer-motion';

const Skeleton = ({ className = '', variant = 'default' }) => {
  const baseClasses = 'bg-slate-700/50 rounded';
  
  const variants = {
    default: 'h-4',
    text: 'h-4',
    title: 'h-8',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
    card: 'h-64',
  };

  return (
    <motion.div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="glass-morphism border border-white/10 rounded-xl p-6 space-y-4">
      <Skeleton variant="title" className="w-3/4" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default Skeleton;

