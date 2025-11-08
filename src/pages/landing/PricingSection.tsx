import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type BillingCycle = "monthly" | "6months" | "12months";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const { toast } = useToast();

  const handleSelectPlan = (plan: string) => {
    toast({
      title: "Plan Selected",
      description: `You've selected the ${plan} plan.`,
    });
  };

  const getPrice = (basePrice: number) => {
    if (billingCycle === "6months") return Math.round(basePrice * 0.9);
    if (billingCycle === "12months") return Math.round(basePrice * 0.8);
    return basePrice;
  };

  const plans = [
    {
      name: "Free Momentum",
      price: 0,
      description: "Perfect for trying out the platform",
      features: [
        "10 Neural Processes/mo",
        "Basic AI Content Transformation",
        "1 Neural Strategy/mo",
        "Access to Free Templates",
        "Standard Analytics",
      ],
      cta: "Your Current Plan",
      popular: false,
      disabled: true,
    },
    {
      name: "Pro Momentum",
      price: 29,
      description: "For serious creators ready to scale",
      features: [
        "Unlimited Neural Processes",
        "Advanced AI Content Transformation",
        "Unlimited Neural Strategies",
        "Full Neural Multiplier Access",
        "All Pro Templates",
        "A/B Testing (Coming Soon)",
        "Deeper Analytics & Insights",
        "Priority Email Support",
      ],
      cta: "Choose Pro Plan",
      popular: true,
      disabled: false,
    },
    {
      name: "Business",
      price: 99,
      description: "For teams and growing businesses",
      features: [
        "Everything in Pro",
        "Team Collaboration (3 seats)",
        "Bulk Operations (Coming Soon)",
        "Advanced Analytics Suite",
        "All Business Templates",
        "Dedicated Account Manager",
      ],
      cta: "Choose Business Plan",
      popular: false,
      disabled: false,
    },
    {
      name: "Business+",
      price: 249,
      description: "Enterprise-grade with custom add-ons",
      features: [
        "All Business features",
        "Dedicated Onboarding (+$100/mo)",
        "API Access (+$150/mo)",
        "Advanced Security & SSO (+$100/mo)",
        "Custom Model Training (+$200/mo)",
        "White-labeling (+$150/mo)",
        "24/7 Priority Support (+$120/mo)",
      ],
      cta: "Contact Sales",
      popular: false,
      disabled: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-cosmic-purple/10 to-background" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Find the Plan That's Right for You
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock the full power of Momentum AI Creator and accelerate your growth
          </p>

          <div className="inline-flex items-center gap-4 glass-morphism p-2 rounded-xl mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-3 rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-neon-blue text-white shadow-[0_0_20px_hsl(var(--neon-blue))]"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("6months")}
              className={`px-6 py-3 rounded-lg transition-all relative ${
                billingCycle === "6months"
                  ? "bg-neon-blue text-white shadow-[0_0_20px_hsl(var(--neon-blue))]"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              6 Months
              <span className="absolute -top-2 -right-2 text-xs bg-neon-magenta px-2 py-1 rounded-full">Save 10%</span>
            </button>
            <button
              onClick={() => setBillingCycle("12months")}
              className={`px-6 py-3 rounded-lg transition-all relative ${
                billingCycle === "12months"
                  ? "bg-neon-blue text-white shadow-[0_0_20px_hsl(var(--neon-blue))]"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              12 Months
              <span className="absolute -top-2 -right-2 text-xs bg-neon-magenta px-2 py-1 rounded-full">Save 20%</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-morphism p-6 rounded-2xl max-w-3xl mx-auto mb-12 border-2 border-neon-blue/30"
          >
            <h3 className="text-xl font-bold mb-3 gradient-text">Creator-First Pledge</h3>
            <p className="text-muted-foreground leading-relaxed">
              We're invested in your success. Monetization features through Momentum AI Creator are{" "}
              <span className="text-neon-blue font-semibold">free until you're earning over $1,000,000/year</span>{" "}
              on-platform. We only succeed when you're massively successful, taking a 20% platform fee only after
              you've hit that milestone.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`glass-morphism p-8 rounded-2xl relative ${
                plan.popular
                  ? "border-2 border-neon-magenta shadow-[0_0_30px_hsl(var(--neon-magenta))]"
                  : "border border-border/50"
              } hover:scale-105 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon-magenta px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold gradient-text">
                  ${getPrice(plan.price)}
                </span>
                <span className="text-muted-foreground">/mo</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.name)}
                disabled={plan.disabled}
                className={`w-full ${
                  plan.popular
                    ? "bg-neon-magenta hover:bg-neon-magenta/80 shadow-[0_0_20px_hsl(var(--neon-magenta))]"
                    : "bg-neon-blue hover:bg-neon-blue/80"
                } ${plan.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
