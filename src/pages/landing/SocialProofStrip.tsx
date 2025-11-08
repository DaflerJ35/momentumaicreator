import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Star } from "lucide-react";

const metrics = [
  { icon: Users, value: "127K+", label: "Active Creators" },
  { icon: DollarSign, value: "$42M+", label: "Revenue Generated" },
  { icon: TrendingUp, value: "10x", label: "Avg Growth Rate" },
  { icon: Star, value: "4.9", label: "User Rating" },
];

const logos = ["TechCrunch", "Forbes", "Product Hunt", "The Verge", "Wired"];

const SocialProofStrip = () => {
  return (
    <section className="relative py-16 border-y border-border/50">
      <div className="absolute inset-0 bg-gradient-to-r from-cosmic-purple/5 via-neon-blue/5 to-cosmic-purple/5" />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">
            Featured In
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-8">
            {logos.map((logo, i) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-foreground/60 font-semibold text-lg hover:text-neon-blue transition-colors"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, rotate: 2 }}
              className="relative glass-morphism p-8 rounded-2xl text-center border border-border/30 hover:border-neon-blue/50 transition-all duration-500 cursor-pointer group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-neon-magenta/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue to-neon-magenta scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <div className="relative z-10">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-neon-blue rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                  <metric.icon className="relative w-10 h-10 mx-auto text-neon-blue group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" />
                </div>
                <div className="text-4xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-300">{metric.value}</div>
                <div className="text-sm text-foreground/60 group-hover:text-foreground/90 font-medium transition-colors duration-300">{metric.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofStrip;
