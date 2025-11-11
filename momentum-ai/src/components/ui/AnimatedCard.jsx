import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';

const AnimatedCard = ({ 
  children, 
  className = '',
  hover = true,
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? {
        y: -8,
        transition: { duration: 0.2 },
      } : {}}
      className={className}
    >
      <motion.div
        whileHover={hover ? {
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        } : {}}
        transition={{ duration: 0.2 }}
      >
        <Card {...props}>
          {children}
        </Card>
      </motion.div>
    </motion.div>
  );
};

AnimatedCard.Content = CardContent;
AnimatedCard.Header = CardHeader;
AnimatedCard.Title = CardTitle;
AnimatedCard.Description = CardDescription;
AnimatedCard.Footer = CardFooter;

export default AnimatedCard;

