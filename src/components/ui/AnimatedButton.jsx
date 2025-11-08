import { motion } from 'framer-motion';
import { Button } from './button';

const AnimatedButton = ({ 
  children, 
  variant = 'default', 
  className = '', 
  onClick,
  disabled = false,
  ...props 
}) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.div
        whileHover={{
          boxShadow: disabled ? 'none' : '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
        transition={{ duration: 0.2 }}
      >
        <Button
          variant={variant}
          className={className}
          onClick={onClick}
          disabled={disabled}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedButton;

