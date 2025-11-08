import { motion } from "framer-motion";
import { Clock, TrendingDown, Zap, AlertCircle } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Time Wasted",
    description: "Spending 40+ hours/week on content creation instead of building",
    color: "neon-blue",
  },
  {
    icon: TrendingDown,
    title: "Inconsistent Results",
    description: "Algorithm changes leaving you scrambling for visibility",
    color: "neon-magenta",
  },
  {
    icon: Zap,
    title: "Platform Overload",
    description: "Juggling 15+ tools just to post and analyze content",
    color: "neon-violet",
  },
  {
    icon: AlertCircle,
    title: "Analysis Paralysis",
    description: "Drowning in data but starving for actionable insights",
    color: "neon-blue",
  },
];

const ProblemSection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-background via-cosmic-purple/5 to-background">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--cosmic-purple))_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Creating Content Shouldn't Feel Like a <span className="gradient-text">Full-Time Job</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative glass-morphism p-8 rounded-2xl border border-red-500/20 hover:border-red-500/60 transition-all duration-500 group cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-red-500 rounded-xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                  <problem.icon className="relative w-14 h-14 text-red-400 group-hover:text-red-300 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-red-400 transition-colors duration-300">{problem.title}</h3>
                <p className="text-foreground/70 leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">{problem.description}</p>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-700 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
