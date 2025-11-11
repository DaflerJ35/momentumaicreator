import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Neural Strategist gave me a roadmap I never could have created myself. Grew from 5K to 150K followers in 90 days.",
    name: "Sarah Chen",
    role: "Lifestyle Creator",
    metric: "5K → 150K",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    quote: "Made $47K in my first month using the AI Content Transformer. This is an unfair advantage.",
    name: "Marcus Rodriguez",
    role: "Digital Marketer",
    metric: "$47K Revenue",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    quote: "I was spending 40 hours/week on content. Now it's 4 hours with better results. Life-changing.",
    name: "Aisha Patel",
    role: "E-commerce Entrepreneur",
    metric: "90% Time Saved",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
  },
  {
    quote: "The Neural Multiplier increased my reach by 1,200%. I'm getting brand deals I only dreamed of.",
    name: "Jake Morrison",
    role: "Fitness Influencer",
    metric: "1,200% Growth",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-32 section-bg-premium">
      <div className="absolute inset-0 z-0">
        <div className="nebula-glow-enhanced w-[550px] h-[550px] bg-neon-magenta top-20 right-20" style={{ opacity: 0.3 }} />
        <div className="nebula-glow-enhanced w-[500px] h-[500px] bg-neon-blue bottom-20 left-20" style={{ opacity: 0.28 }} />
        <div className="nebula-glow-enhanced w-[450px] h-[450px] bg-neon-violet top-1/3 left-1/2 -translate-x-1/2" style={{ opacity: 0.25 }} />
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
            Real Creators. Real Revenue. <span className="gradient-text">Real Fast.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.06, y: -12 }}
              className="relative premium-card premium-card-holographic p-10 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-magenta/10 via-transparent to-neon-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-neon-magenta/15 rounded-full blur-3xl group-hover:bg-neon-magenta/25 transition-all duration-500" />
              <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-neon-violet/12 rounded-full blur-2xl group-hover:bg-neon-violet/22 transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-magenta rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="relative w-20 h-20 rounded-full border-2 border-neon-blue group-hover:border-neon-magenta transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl group-hover:text-neon-blue transition-colors duration-300">{testimonial.name}</h4>
                    <p className="text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors duration-300">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="mb-6 inline-block">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-magenta blur-xl opacity-50" />
                    <span className="relative text-4xl font-bold gradient-text group-hover:scale-110 inline-block transition-transform duration-300">{testimonial.metric}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <span className="text-5xl text-neon-magenta/30 absolute -top-2 -left-2">"</span>
                  <p className="text-foreground/80 group-hover:text-foreground leading-relaxed italic text-lg pl-6 transition-colors duration-300">{testimonial.quote}</p>
                  <span className="text-5xl text-neon-magenta/30 absolute -bottom-6 right-0">"</span>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-magenta to-neon-violet scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
