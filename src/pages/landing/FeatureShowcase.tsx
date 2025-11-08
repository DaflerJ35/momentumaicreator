import { motion } from "framer-motion";
import { Brain, Rocket, Wand2, LineChart } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Neural Strategist",
    description: "AI analyzes market trends, competitor data, audience behavior. Generates custom growth strategies in 60 seconds.",
    tagline: "Stop guessing. Start winning.",
  },
  {
    icon: Rocket,
    title: "Neural Multiplier",
    description: "Amplifies content reach across all platforms automatically. Intelligent distribution algorithms maximize engagement.",
    tagline: "10x your reach without 10x the work.",
  },
  {
    icon: Wand2,
    title: "AI Content Transformer",
    description: "Turn one idea into 50+ pieces of platform-optimized content. Blogs → Threads → Reels → Newsletters in one click.",
    tagline: "Create once. Distribute everywhere.",
  },
  {
    icon: LineChart,
    title: "AI Potential Analyzer",
    description: "Deep growth insights from your data. Predictive analytics for next moves powered by RAG.",
    tagline: "Know what works before you post it.",
  },
];

const FeatureShowcase = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-cosmic-purple/20" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            One Platform. <span className="gradient-text">Infinite Momentum.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative glass-morphism p-10 rounded-2xl border border-border/30 hover:border-neon-blue/50 transition-all duration-500 group cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-magenta/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl group-hover:bg-neon-blue/20 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-violet rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <feature.icon className="relative w-16 h-16 text-neon-blue group-hover:text-neon-violet group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-neon-blue transition-colors duration-300">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed mb-6 group-hover:text-foreground/90 transition-colors duration-300">{feature.description}</p>
                <div className="flex items-start gap-2">
                  <span className="text-2xl text-neon-magenta group-hover:scale-125 inline-block transition-transform duration-300">"</span>
                  <p className="text-neon-magenta font-semibold italic text-lg group-hover:text-neon-violet transition-colors duration-300">{feature.tagline}</p>
                  <span className="text-2xl text-neon-magenta group-hover:scale-125 inline-block transition-transform duration-300">"</span>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue via-neon-violet to-neon-magenta scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
