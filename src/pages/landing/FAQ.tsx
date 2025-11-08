import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How is this different from other AI content tools?",
    answer:
      "Momentum AI is the only platform that combines strategy generation, content creation, AND distribution automation in one place. While other tools just generate content, we analyze your market, create your strategy, produce platform-optimized content, and automatically distribute it for maximum reach.",
  },
  {
    question: "Do I need tech skills to use Momentum AI?",
    answer:
      "Absolutely not. Our interface is designed for creators, not engineers. If you can type an idea or record a voice note, you can use Momentum AI. Our Neural Strategist guides you through every step.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! You can cancel your subscription at any time with no penalties or questions asked. Your access continues until the end of your billing period.",
  },
  {
    question: "What happens when I hit $1M in revenue?",
    answer:
      "First, congratulations! When you cross $1M/year in revenue generated through Momentum AI, we take a 20% platform fee on revenue above that threshold. This aligns our success with yours — we only win when you're winning big.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use bank-level encryption (AES-256), SOC 2 Type II compliance, and never sell your data to third parties. Your content, strategies, and analytics belong to you and only you.",
  },
  {
    question: "How does the Neural Multiplier actually work?",
    answer:
      "The Neural Multiplier uses proprietary algorithms to analyze engagement patterns across platforms, optimal posting times, audience behavior, and trending topics. It then automatically schedules and publishes your content when it's most likely to perform well on each specific platform.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "Yes! We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied for any reason within the first 14 days, contact support for a full refund.",
  },
];

const FAQ = () => {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-purple/10 to-background" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Momentum AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-morphism rounded-xl px-6 border border-border/50"
              >
                <AccordionTrigger className="text-left text-lg font-semibold hover:text-neon-blue">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
