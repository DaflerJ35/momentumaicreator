import { Button } from "@/components/ui/button";
import { Play, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard', { state: { showAuth: true } });
    }
  };

  const handleWatchDemo = () => {
    toast({
      title: "Demo Video",
      description: "Opening 2-minute demo...",
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cosmic-bg">
      {/* Nebula Effects */}
      <div className="nebula-glow w-96 h-96 bg-neon-violet top-20 left-10" />
      <div className="nebula-glow w-80 h-80 bg-neon-magenta bottom-20 right-10" />
      <div className="nebula-glow w-72 h-72 bg-neon-blue top-40 right-20" />

      {/* Floating Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
          }}
        />
      ))}

      {/* Logo Background Layer - Behind Everything */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden"
      >
      {/* Ultra-diffuse video background - seamless integration */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover opacity-25 mix-blend-screen"
            style={{ filter: 'blur(2px) saturate(1.3)' }}
          >
            <source src="/hero-background.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Layered glow overlay for perfect blend */}
        <div className="absolute w-[1400px] h-[1400px] bg-gradient-to-r from-neon-blue/12 via-neon-violet/12 to-neon-magenta/12 rounded-full blur-[350px] animate-pulse" />
        <div className="absolute w-[1000px] h-[1000px] bg-gradient-to-br from-neon-magenta/8 via-neon-blue/8 to-neon-violet/8 rounded-full blur-[300px]" />
      </motion.div>

      {/* Content Layer - Crisp & Clear */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glow background behind text */}
            <span className="absolute inset-0 blur-[40px] bg-gradient-to-r from-neon-blue/60 via-neon-violet/60 to-neon-magenta/60" />
            
            <span className="inline-block hover:scale-105 transition-transform duration-300 relative z-10">
              <span className="gradient-text" style={{ 
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,1))'
              }}>Turn Ideas Into</span>
            </span>
            <br />
            <span className="inline-block hover:scale-105 transition-transform duration-300 relative z-10">
              <span className="gradient-text" style={{ 
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.9)) drop-shadow(0 2px 4px rgba(0,0,0,1))'
              }}>Revenue in Seconds</span>
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-foreground/90 mb-8 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The <span className="text-neon-blue font-semibold">AI-powered</span> creator platform that <span className="text-neon-magenta font-semibold">multiplies</span> your content reach, <span className="text-neon-violet font-semibold">automates</span> your strategy, and <span className="text-neon-blue font-semibold">scales</span> your business while you sleep.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="relative group bg-gradient-to-r from-neon-blue to-neon-violet hover:from-neon-violet hover:to-neon-magenta text-white px-12 py-8 text-xl font-bold rounded-xl shadow-[0_0_40px_hsl(var(--neon-blue))] hover:shadow-[0_0_80px_hsl(var(--neon-magenta))] transition-all duration-500 transform hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free — No Credit Card
                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-neon-magenta to-neon-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWatchDemo}
              className="relative group border-2 border-neon-blue text-neon-blue hover:text-white px-12 py-8 text-xl font-semibold rounded-xl transition-all duration-300 hover:border-neon-magenta hover:shadow-[0_0_40px_hsl(var(--neon-blue))] transform hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Watch 2-Min Demo
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-magenta/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-foreground/60 text-lg flex flex-wrap items-center justify-center gap-6"
          >
            <span className="flex items-center gap-2">
              <span className="text-neon-blue font-semibold">127,000+</span> creators
            </span>
            <span className="text-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="text-neon-magenta font-semibold">$42M+</span> generated
            </span>
            <span className="text-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="text-neon-violet font-semibold">4.9★</span> rating
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 text-neon-blue animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
