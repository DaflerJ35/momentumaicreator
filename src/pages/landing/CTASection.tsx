import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const CTASection = () => {
  const { toast } = useToast();

  const handleCTA = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
    toast({
      title: "Let's Transform Your Content",
      description: "Choose your plan and unlock your potential.",
    });
  };

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 cosmic-bg" />
      <div className="nebula-glow w-96 h-96 bg-neon-magenta top-10 left-10" />
      <div className="nebula-glow w-80 h-80 bg-neon-blue bottom-10 right-10" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            whileHover={{ scale: 1.05 }}
          >
            <span className="inline-block gradient-text neon-glow-magenta">
              Your Unfair Advantage
            </span>
            <br />
            <span className="inline-block gradient-text neon-glow">
              Starts Now
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Join <span className="text-neon-blue font-bold">127,000+</span> creators who've stopped <span className="line-through text-foreground/40">working harder</span> and started <span className="text-neon-magenta font-bold">working smarter</span>.
          </motion.p>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={handleCTA}
              className="relative group bg-gradient-to-r from-neon-blue via-neon-violet to-neon-magenta hover:from-neon-magenta hover:via-neon-violet hover:to-neon-blue text-white px-20 py-12 text-3xl font-bold rounded-2xl shadow-[0_0_60px_hsl(var(--neon-blue))] hover:shadow-[0_0_100px_hsl(var(--neon-magenta))] transition-all duration-500 mb-8 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-4">
                Start Free Today
                <Rocket className="h-10 w-10 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/70"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
              No credit card required
            </span>
            <span className="text-foreground/40">•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-magenta rounded-full animate-pulse" />
              Cancel anytime
            </span>
            <span className="text-foreground/40">•</span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-violet rounded-full animate-pulse" />
              14-day money-back guarantee
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
