import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Sparkles, Rocket, Users, Shield, ZapOff, Clock, BarChart2, Mail, LifeBuoy, CreditCard, Loader2, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import PlanUpgradeModal from '../../components/checkout/PlanUpgradeModal';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BILLING_CYCLES = [
  { id: 'monthly', label: 'Monthly', discount: 0 },
  { id: '6months', label: '6 Months', discount: 10 },
  { id: '12months', label: '12 Months', discount: 20 },
];

const PLANS = {
  free: {
    name: 'Free Momentum',
    description: 'For creators just getting started.',
    icon: <ZapOff className="h-6 w-6 text-slate-400" />,
    features: [
      '10 Neural Processes /mo',
      'Basic AI Content Transformation',
      '1 Neural Strategy /mo',
      'Access to Free Templates',
      'Standard Analytics'
    ],
    price: {
      monthly: 0,
      '6months': 0,
      '12months': 0
    },
    cta: 'Your Current Plan',
    popular: false,
    current: true,
    buttonVariant: 'outline'
  },
  pro: {
    name: 'Pro Momentum',
    description: 'For serious creators ready to scale.',
    icon: <Zap className="h-6 w-6 text-yellow-400" />,
    features: [
      'Unlimited Neural Processes',
      'Advanced AI Content Transformation',
      'Unlimited Neural Strategies',
      'Full Neural Multiplier Access',
      'Access to All Pro Templates',
      'AI Image Generation (50/month)',
      'AI Video Generation (10/month)',
      'AI Voice Over (30 minutes/month)',
      'Deeper Analytics & Insights',
      'Priority Email Support'
    ],
    price: {
      monthly: 29,
      '6months': 26,
      '12months': 23
    },
    cta: 'Choose Pro Plan',
    popular: true,
    current: false,
    buttonVariant: 'default'
  },
  business: {
    name: 'Business',
    description: 'For agencies and creator teams.',
    icon: <Users className="h-6 w-6 text-purple-400" />,
    features: [
      'Everything in Pro',
      'Team Collaboration (3 members)',
      'AI Image Generation (200/month)',
      'AI Video Generation (50/month)',
      'AI Voice Over (120 minutes/month)',
      'Marketplace Access',
      'Referral Program Benefits',
      'Advanced Analytics Suite',
      'Access to All Business Templates',
      'Dedicated Account Manager'
    ],
    price: {
      monthly: 99,
      '6months': 89,
      '12months': 79
    },
    cta: 'Choose Business Plan',
    popular: false,
    current: false,
    buttonVariant: 'default'
  },
  businessPlus: {
    name: 'Business+',
    description: 'Custom solutions for enterprise needs.',
    icon: <Rocket className="h-6 w-6 text-emerald-400" />,
    baseFeatures: [
      'Everything in Business',
      'Unlimited AI Image Generation',
      'Unlimited AI Video Generation',
      'Unlimited AI Voice Over',
      'Priority Marketplace Listing',
      'Advanced Referral Rewards',
      '24/7 Priority Support'
    ],
    addOns: [
      {
        id: 'onboarding',
        name: 'Dedicated Onboarding & Training',
        price: 150,
        description: 'Personalized onboarding and team training sessions'
      },
      {
        id: 'api',
        name: 'API Access & Integrations',
        price: 200,
        description: 'Full API access with custom integrations'
      },
      {
        id: 'security',
        name: 'Advanced Security & SSO',
        price: 150,
        description: 'Enterprise-grade security with SSO support'
      },
      {
        id: 'training',
        name: 'Custom Model Training',
        price: 200,
        description: 'Train custom AI models for your brand'
      },
      {
        id: 'whitelabel',
        name: 'White-labeling & Custom Branding',
        price: 119,
        description: 'Fully branded experience with your logo and colors'
      }
    ],
    price: {
      monthly: 250,
      '6months': 225,
      '12months': 200
    },
    cta: 'Choose Business+ Plan',
    popular: false,
    current: false,
    buttonVariant: 'default',
    custom: false
  }
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [businessPlusAddOns, setBusinessPlusAddOns] = useState({});
  const [showBusinessPlusModal, setShowBusinessPlusModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async (planKey) => {
    if (planKey === 'businessPlus') {
      setShowBusinessPlusModal(true);
      return;
    }

    setSelectedPlan({
      ...PLANS[planKey],
      key: planKey
    });
    
    if (planKey === 'free') {
      setIsLoading(true);
      try {
        // In a real app, you would call your API to update the user's plan
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Successfully switched to the Free plan');
        // Refresh user data or update context
      } catch (error) {
        console.error('Error updating plan:', error);
        toast.error('Failed to update plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // For paid plans, open the upgrade modal
      setIsModalOpen(true);
    }
  };

  const calculateBusinessPlusPrice = () => {
    const basePrice = PLANS.businessPlus.price[billingCycle];
    const selectedAddOns = Object.entries(businessPlusAddOns)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => {
        const addOn = PLANS.businessPlus.addOns.find(a => a.id === id);
        return addOn ? addOn.price : 0;
      });
    const addOnsTotal = selectedAddOns.reduce((sum, price) => sum + price, 0);
    return basePrice + addOnsTotal;
  };

  const handleBusinessPlusAddOnToggle = (addOnId) => {
    setBusinessPlusAddOns(prev => ({
      ...prev,
      [addOnId]: !prev[addOnId]
    }));
  };

  const handleBusinessPlusCheckout = () => {
    const selectedAddOnsList = Object.entries(businessPlusAddOns)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => {
        const addOn = PLANS.businessPlus.addOns.find(a => a.id === id);
        return addOn;
      })
      .filter(Boolean);

    const finalPrice = calculateBusinessPlusPrice();
    
    setSelectedPlan({
      ...PLANS.businessPlus,
      key: 'businessPlus',
      selectedAddOns: selectedAddOnsList,
      finalPrice: finalPrice,
      billingCycle: billingCycle
    });
    
    setShowBusinessPlusModal(false);
    setIsModalOpen(true);
  };

  const handleUpgradeSuccess = () => {
    // Handle successful upgrade (e.g., refresh user data, show success message)
    toast.success('Your plan has been upgraded successfully!');
    setIsModalOpen(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getBillingText = () => {
    switch (billingCycle) {
      case '6months':
        return 'Billed every 6 months';
      case '12months':
        return 'Billed annually';
      default:
        return 'Billed monthly';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Choose the plan that's right for you. All plans come with a 14-day free trial. No credit card required.
          </p>
          
          <div className="mt-8 flex justify-center">
            <Tabs 
              value={billingCycle} 
              onValueChange={setBillingCycle}
              className="bg-slate-800/50 p-1 rounded-lg border border-slate-700/50"
            >
              <TabsList className="grid grid-cols-3 gap-1 h-auto bg-transparent">
                {BILLING_CYCLES.map((cycle) => (
                  <TabsTrigger 
                    key={cycle.id} 
                    value={cycle.id}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      billingCycle === cycle.id 
                        ? 'bg-slate-700 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {cycle.label}
                    {cycle.discount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400">
                        Save {cycle.discount}%
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * Object.keys(PLANS).indexOf(key) }}
              className={`relative rounded-xl border ${
                plan.popular 
                  ? 'border-emerald-500/30 bg-gradient-to-b from-slate-800/50 to-slate-900/80 shadow-lg shadow-emerald-500/10' 
                  : 'border-slate-800 bg-slate-900/50'
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              
              {plan.current && (
                <div className="absolute top-0 right-0 bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Your Current Plan
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-lg bg-slate-800/50 mr-3">
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-slate-400 text-sm">{plan.description}</p>
                  </div>
                </div>

                <div className="my-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      {key === 'free' 
                        ? 'Free' 
                        : key === 'businessPlus'
                        ? formatPrice(PLANS.businessPlus.price[billingCycle])
                        : formatPrice(plan.price[billingCycle])
                      }
                    </span>
                    {key !== 'free' && (
                      <span className="ml-2 text-slate-400">/mo</span>
                    )}
                  </div>
                  {key === 'businessPlus' && (
                    <p className="text-xs text-slate-400 mt-1">
                      Base price + add-ons (up to {formatPrice(1069)}/mo)
                    </p>
                  )}
                  {key !== 'free' && key !== 'businessPlus' && (
                    <p className="text-sm text-slate-400 mt-1">{getBillingText()}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {(plan.baseFeatures || plan.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5 mr-2" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                  {key === 'businessPlus' && plan.addOns && (
                    <li className="text-xs text-slate-400 mt-2">
                      + {plan.addOns.length} optional add-ons available
                    </li>
                  )}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600' 
                      : plan.current 
                        ? 'bg-slate-800 text-white hover:bg-slate-700' 
                        : key === 'businessPlus'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600'
                        : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  size="lg"
                  onClick={() => handleUpgrade(key)}
                  disabled={isLoading && selectedPlan?.key === key}
                >
                  {isLoading && selectedPlan?.key === key ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">Need a custom solution?</h3>
            <p className="text-slate-400 mb-6">
              Our team can create a custom plan tailored to your specific needs. Get in touch with us to discuss enterprise options, volume discounts, and custom integrations.
            </p>
            <Button 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-slate-700/50 hover:border-slate-500"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {[
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), as well as PayPal and bank transfers for annual plans.'
              },
              {
                question: 'Can I change plans later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Your billing will be prorated based on your usage.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes, all paid plans come with a 14-day free trial. No credit card is required to start your trial.'
              },
              {
                question: 'What happens if I exceed my plan limits?',
                answer: 'If you exceed your plan limits, we\'ll notify you and give you the option to upgrade your plan or purchase additional credits.'
              },
              {
                question: 'Do you offer discounts for non-profits?',
                answer: 'Yes, we offer special pricing for registered non-profit organizations. Please contact our sales team for more information.'
              },
              {
                question: 'How do I cancel my subscription?',
                answer: 'You can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period.'
              },
              {
                question: 'What are the limits for multimedia generation?',
                answer: 'Each plan includes monthly limits for image, video, and voice generation. Pro plan: 50 images, 10 videos, 30 min voice. Business: 200 images, 50 videos, 120 min voice. Business+: Unlimited.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-slate-800/30 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">{faq.question}</h4>
                <p className="text-slate-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Plus Add-Ons Modal */}
      <AnimatePresence>
        {showBusinessPlusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowBusinessPlusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Customize Business+ Plan</h2>
                  <p className="text-slate-400 text-sm mt-1">Select add-ons to customize your plan</p>
                </div>
                <button
                  onClick={() => setShowBusinessPlusModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Base Plan</p>
                      <p className="text-2xl font-bold text-white">
                        {formatPrice(PLANS.businessPlus.price[billingCycle])}
                        <span className="text-sm text-slate-400 font-normal">/mo</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total with Add-ons</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatPrice(calculateBusinessPlusPrice())}
                        <span className="text-sm text-slate-400 font-normal">/mo</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Available Add-ons</h3>
                  {PLANS.businessPlus.addOns.map((addOn) => (
                    <motion.div
                      key={addOn.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        businessPlusAddOns[addOn.id]
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                      }`}
                      onClick={() => handleBusinessPlusAddOnToggle(addOn.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            businessPlusAddOns[addOn.id]
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-slate-600 bg-transparent'
                          }`}>
                            {businessPlusAddOns[addOn.id] && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-white">{addOn.name}</h4>
                              <span className="text-lg font-bold text-emerald-400 ml-4">
                                +{formatPrice(addOn.price)}/mo
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{addOn.description}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-600 text-white hover:bg-slate-800"
                    onClick={() => setShowBusinessPlusModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                    onClick={handleBusinessPlusCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Upgrade Modal */}
      {selectedPlan && (
        <PlanUpgradeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
            setBusinessPlusAddOns({});
          }}
          plan={selectedPlan}
          billingCycle={selectedPlan.billingCycle || billingCycle}
          onSuccess={handleUpgradeSuccess}
        />
      )}
    </div>
  );
};

export default Pricing;
