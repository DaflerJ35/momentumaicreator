import { motion } from "framer-motion";
import { Lightbulb, Cpu, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    step: "01",
    title: "Input Your Idea",
    description: "Type, voice, or upload — however inspiration strikes you.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Does the Heavy Lifting",
    description: "Strategy, content, distribution planned in seconds.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Watch Your Growth Explode",
    description: "Automated posting, analytics, and optimization.",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-32 section-bg-premium">
      <div className="absolute inset-0 z-0">
        <div className="nebula-glow-enhanced w-[550px] h-[550px] bg-neon-violet top-20 left-1/4" style={{ opacity: 0.28 }} />
        <div className="nebula-glow-enhanced w-[450px] h-[450px] bg-neon-blue bottom-20 right-1/4" style={{ opacity: 0.25 }} />
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
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to transform your content game
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative mb-16 last:mb-0 group"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 8 }}
                  className="relative premium-card premium-card-holographic p-8 flex-shrink-0 w-40 h-40 flex items-center justify-center cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/15 to-neon-violet/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-neon-blue/25 rounded-full blur-3xl group-hover:bg-neon-blue/45 transition-all duration-500" />
                  <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-neon-violet/20 rounded-full blur-2xl group-hover:bg-neon-violet/35 transition-all duration-500" />
                  <div className="relative z-10">
                    <step.icon className="w-20 h-20 text-neon-blue group-hover:text-neon-violet group-hover:scale-110 transition-all duration-500" />
                  </div>
                </motion.div>
                
                <div className="flex-1 text-center md:text-left">
                  <motion.div 
                    className="text-7xl font-bold gradient-text opacity-20 mb-3"
                    whileHover={{ scale: 1.1, opacity: 0.4 }}
                  >
                    {step.step}
                  </motion.div>
                  <h3 className="text-4xl font-bold mb-4 group-hover:text-neon-blue transition-colors duration-300">{step.title}</h3>
                  <p className="text-xl text-foreground/70 group-hover:text-foreground/90 leading-relaxed transition-colors duration-300">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <motion.div 
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="hidden md:block absolute left-20 top-40 w-1 h-20 bg-gradient-to-b from-neon-blue via-neon-violet to-neon-magenta origin-top"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
