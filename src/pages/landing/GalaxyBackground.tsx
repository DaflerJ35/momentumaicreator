import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const GalaxyBackground = () => {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);
  
  // Parallax transforms for different layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Base galaxy gradient */}
      <div className="galaxy-bg" />
      
      {/* Animated starfield */}
      <div className="stars-layer" />
      
      {/* Shooting stars */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`star-${i}`} className="shooting-star" />
      ))}
      
      {/* Floating galaxy orbs */}
      <motion.div 
        className="galaxy-orb bg-gradient-to-r from-neon-blue to-neon-violet"
        style={{ 
          y: y1,
          rotate,
          top: '10%',
          left: '10%'
        }}
      />
      <motion.div 
        className="galaxy-orb bg-gradient-to-r from-neon-magenta to-neon-violet"
        style={{ 
          y: y2,
          scale,
          top: '50%',
          right: '10%'
        }}
      />
      <motion.div 
        className="galaxy-orb bg-gradient-to-r from-neon-violet to-neon-blue"
        style={{ 
          y: y3,
          bottom: '10%',
          left: '30%'
        }}
      />
      
      {/* Nebula clouds that move on scroll */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="nebula-glow"
          style={{
            width: `${Math.random() * 400 + 300}px`,
            height: `${Math.random() * 400 + 300}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            y: i % 2 === 0 ? y1 : y2,
            background: i % 3 === 0 
              ? 'hsl(var(--neon-blue))' 
              : i % 3 === 1 
              ? 'hsl(var(--neon-magenta))' 
              : 'hsl(var(--neon-violet))',
            animationDelay: `${i * 2}s`,
            zIndex: 1
          }}
        />
      ))}
    </>
  );
};

export default GalaxyBackground;
