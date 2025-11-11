import { loadStripe } from '@stripe/stripe-js';

// Use Vite environment variable
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Stripe publishable key is not configured');
}

export const stripePromise = loadStripe(stripePublishableKey);

/**
 * Create a Stripe checkout session
 * @param {string} plan - Plan tier (e.g., 'starter', 'pro', 'enterprise')
 * @param {string} billingCycle - Billing cycle ('monthly' or 'annual')
 * @param {string} customerEmail - Customer email address
 * @returns {Promise<{sessionId: string}>} Checkout session details
 */
export const createCheckoutSession = async (plan, billingCycle, customerEmail) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan,
        billingCycle,
        customerEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Redirect to Stripe Checkout
 * @param {string} plan - Plan tier
 * @param {string} billingCycle - Billing cycle
 * @param {string} customerEmail - Customer email
 */
export const redirectToCheckout = async (plan, billingCycle, customerEmail) => {
  try {
    const stripe = await stripePromise;
    const { sessionId } = await createCheckoutSession(plan, billingCycle, customerEmail);
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};
