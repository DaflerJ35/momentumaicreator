import { motion } from "framer-motion";
import { Sparkles, Command, Gauge, Layers } from "lucide-react";

const features = [
  { icon: Sparkles, label: "Glassmorphism Design" },
  { icon: Layers, label: "3D Backgrounds" },
  { icon: Command, label: "Command Palette (Cmd+K)" },
  { icon: Gauge, label: "Real-time Network Pulse" },
];

const PlatformShowcase = () => {
  return (
    <section className="relative py-32 overflow-hidden section-bg-premium">
      <div className="absolute inset-0 z-0">
        <div className="nebula-glow-enhanced w-[600px] h-[600px] bg-neon-blue top-10 right-10" style={{ opacity: 0.35 }} />
        <div className="nebula-glow-enhanced w-[500px] h-[500px] bg-neon-magenta bottom-10 left-10" style={{ opacity: 0.3 }} />
        <div className="nebula-glow-enhanced w-[450px] h-[450px] bg-neon-violet top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.25 }} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            A Dashboard That Feels Like the Future
          </h2>
          <p className="text-xl text-muted-foreground">
            Production-ready. Gorgeous. Powerful.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.03 }}
          className="relative premium-card premium-card-holographic p-10 mb-12 max-w-5xl mx-auto group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-blue/15 rounded-full blur-3xl group-hover:bg-neon-blue/25 transition-all duration-500" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-neon-violet/12 rounded-full blur-2xl group-hover:bg-neon-violet/22 transition-all duration-500" />
          
          <div className="relative aspect-video bg-gradient-to-br from-cosmic-purple/30 via-neon-violet/20 to-neon-blue/30 rounded-2xl flex items-center justify-center border border-neon-blue/50 group-hover:border-neon-blue overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,184,198,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(50,184,198,0.1)_50%,transparent_52%)] bg-[length:20px_20px] animate-gradient-shift" />
            
            <div className="relative text-center z-10">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-neon-blue rounded-full blur-3xl opacity-50 group-hover:opacity-100 animate-pulse" />
                <Sparkles className="relative w-24 h-24 mx-auto text-neon-blue group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
              </div>
              <p className="text-2xl font-bold gradient-text">Dashboard Preview</p>
              <p className="text-sm text-foreground/60 mt-2">Interactive • Real-time • Beautiful</p>
            </div>
            
            {/* Floating orbs */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-neon-blue/20 rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-neon-magenta/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.12, rotate: 5 }}
              className="relative premium-card premium-card-holographic p-8 text-center group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-magenta/12 to-neon-violet/12 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-magenta/20 rounded-full blur-2xl group-hover:bg-neon-magenta/30 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-neon-magenta rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <feature.icon className="relative w-12 h-12 mx-auto text-neon-magenta group-hover:scale-125 group-hover:-rotate-12 transition-all duration-500" />
                </div>
                <p className="text-sm font-semibold text-foreground group-hover:text-neon-magenta transition-colors duration-300">{feature.label}</p>
              </div>
              
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-neon-magenta to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformShowcase;
