import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const GalaxyBackground = () => {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);
  
  // Enhanced parallax transforms for different layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const rotateReverse = useTransform(scrollYProgress, [0, 1], [360, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 1]);
  const scale2 = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 1]);
  
  // Create all nebula y transforms upfront (12 total)
  const nebulaY0 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const nebulaY1 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const nebulaY2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const nebulaY3 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const nebulaY4 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const nebulaY5 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const nebulaY6 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const nebulaY7 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const nebulaY8 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const nebulaY9 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const nebulaY10 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const nebulaY11 = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const nebulaYTransforms = [nebulaY0, nebulaY1, nebulaY2, nebulaY3, nebulaY4, nebulaY5, nebulaY6, nebulaY7, nebulaY8, nebulaY9, nebulaY10, nebulaY11];
  
  // Create all particle y transforms upfront (15 total) - using simpler approach with CSS animations

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Enhanced base galaxy gradient */}
      <div className="galaxy-bg-enhanced" />
      
      {/* Animated starfield with multiple layers */}
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      
      {/* Shooting stars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div 
          key={`star-${i}`} 
          className="shooting-star"
          style={{
            left: `${15 + i * 12}%`,
            animationDelay: `${i * 3}s`,
            animationDuration: `${3 + (i % 3)}s`
          }}
        />
      ))}
      
      {/* Enhanced floating galaxy orbs with more depth */}
      <motion.div 
        className="galaxy-orb galaxy-orb-1"
        style={{ 
          y: y1,
          rotate,
          scale,
          top: '8%',
          left: '8%'
        }}
      />
      <motion.div 
        className="galaxy-orb galaxy-orb-2"
        style={{ 
          y: y2,
          rotate: rotateReverse,
          scale: scale2,
          top: '45%',
          right: '8%'
        }}
      />
      <motion.div 
        className="galaxy-orb galaxy-orb-3"
        style={{ 
          y: y3,
          rotate,
          bottom: '12%',
          left: '25%'
        }}
      />
      <motion.div 
        className="galaxy-orb galaxy-orb-4"
        style={{ 
          y: y4,
          rotate: rotateReverse,
          top: '70%',
          right: '35%'
        }}
      />
      
      {/* Enhanced nebula clouds with scroll-based movement - using CSS animations for performance */}
      {Array.from({ length: 12 }).map((_, i) => {
        const baseX = (i % 4) * 25;
        const baseY = Math.floor(i / 4) * 33;
        return (
          <motion.div
            key={`nebula-${i}`}
            className="nebula-glow-enhanced"
            style={{
              width: `${300 + (i % 3) * 200}px`,
              height: `${300 + (i % 3) * 200}px`,
              top: `${baseY + (i % 3) * 5}%`,
              left: `${baseX + (i % 2) * 10}%`,
              y: nebulaYTransforms[i],
              background: i % 4 === 0 
                ? 'radial-gradient(circle, hsl(var(--neon-blue) / 0.3) 0%, hsl(var(--neon-blue) / 0.1) 40%, transparent 70%)' 
                : i % 4 === 1 
                ? 'radial-gradient(circle, hsl(var(--neon-magenta) / 0.3) 0%, hsl(var(--neon-magenta) / 0.1) 40%, transparent 70%)'
                : i % 4 === 2
                ? 'radial-gradient(circle, hsl(var(--neon-violet) / 0.3) 0%, hsl(var(--neon-violet) / 0.1) 40%, transparent 70%)'
                : 'radial-gradient(circle, hsl(var(--neon-blue) / 0.25) 0%, hsl(var(--neon-violet) / 0.15) 40%, transparent 70%)',
              animationDelay: `${i * 1.5}s`,
              zIndex: 1
            }}
          />
        );
      })}
      
      {/* Floating energy particles - using CSS animations for better performance */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`particle-${i}`}
          className="energy-particle"
          style={{
            width: `${4 + (i % 3)}px`,
            height: `${4 + (i % 3)}px`,
            top: `${(i * 7) % 100}%`,
            left: `${(i * 11) % 100}%`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
    </>
  );
};

export default GalaxyBackground;
