import { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function CheckoutForm({ plan, billingCycle, onSuccess, onCancel }) {
  const stripe = useStripe();
  const { currentUser } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [email, setEmail] = useState('');

  // Use authenticated user's email if available
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe) {
      setError('Stripe is not loaded. Please refresh the page.');
      toast.error('Payment system not ready. Please refresh the page.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    // Require authentication for checkout
    if (!currentUser) {
      setError('Please sign in to continue');
      toast.error('Please sign in to continue with your subscription');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get auth token for authenticated request (force refresh to ensure valid token)
      let token;
      try {
        token = await currentUser.getIdToken(true); // Force refresh for security
      } catch (tokenError) {
        setError('Your session has expired. Please sign in again.');
        toast.error('Session expired. Please sign in again.');
        setLoading(false);
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
        }, 2000);
        return;
      }
      
      // Sanitize and validate input
      const sanitizedPlan = String(plan.key || '').trim();
      const sanitizedBillingCycle = String(billingCycle || 'monthly').trim();
      const sanitizedEmail = String(email || currentUser.email || '').trim().toLowerCase();
      
      // Validate plan
      const validPlans = ['free', 'pro', 'business', 'businessPlus'];
      if (!validPlans.includes(sanitizedPlan)) {
        throw new Error('Invalid plan selected');
      }
      
      // Validate billing cycle
      const validBillingCycles = ['monthly', '6months', '12months'];
      if (!validBillingCycles.includes(sanitizedBillingCycle)) {
        throw new Error('Invalid billing cycle');
      }
      
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        throw new Error('Invalid email address');
      }
      
      // Validate final price (must be a number >= 0)
      const finalPrice = plan.finalPrice || plan.price[billingCycle];
      if (typeof finalPrice !== 'number' || finalPrice < 0 || !isFinite(finalPrice)) {
        throw new Error('Invalid price');
      }
      
      // Call backend to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: sanitizedPlan,
          billingCycle: sanitizedBillingCycle,
          customerEmail: sanitizedEmail,
          selectedAddOns: (plan.selectedAddOns || []).filter(addOn => 
            addOn && typeof addOn === 'object' && 
            typeof addOn.id === 'string' && 
            typeof addOn.name === 'string' &&
            typeof addOn.price === 'number'
          ),
          finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
        }),
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
          setError('Your session has expired. Please sign in again.');
          toast.error('Session expired. Please sign in again.');
          setLoading(false);
          setTimeout(() => {
            window.location.href = '/auth/signin?redirect=' + encodeURIComponent(window.location.pathname);
          }, 2000);
          return;
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        // Don't expose internal error details
        const errorMessage = errorData.message || errorData.error || 'Failed to create checkout session. Please try again.';
        throw new Error(errorMessage);
      }

      const { sessionId } = await response.json();
      
      if (!sessionId) {
        throw new Error('No session ID returned from server');
      }
      
      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      
      if (stripeError) {
        throw new Error(stripeError.message || 'Failed to redirect to checkout');
      }
      
      // If we get here, redirect was successful (shouldn't happen)
      setLoading(false);
    } catch (err) {
      const errorMessage = err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Complete your purchase</h3>
        <p className="text-sm text-gray-600">
          You're about to subscribe to the <span className="font-medium">{plan.name}</span> plan 
          ({billingCycle === 'monthly' ? 'Monthly' : billingCycle === '6months' ? '6 Months' : 'Yearly'})
        </p>
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total due today</span>
            <span className="text-lg font-bold">
              {plan.finalPrice 
                ? `$${plan.finalPrice}` 
                : plan.price[billingCycle] === 0 
                ? 'Free' 
                : `$${plan.price[billingCycle]}`}
              {((plan.finalPrice || plan.price[billingCycle]) > 0) && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {billingCycle === '6months' ? ' every 6 months' : billingCycle === '12months' ? ' per year' : '/month'}
                </span>
              )}
            </span>
          </div>
          {plan.selectedAddOns && plan.selectedAddOns.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Selected Add-ons:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {plan.selectedAddOns.map((addOn, idx) => (
                  <li key={idx}>• {addOn.name} (+${addOn.price}/mo)</li>
                ))}
              </ul>
            </div>
          )}
          {billingCycle !== 'monthly' && (plan.finalPrice || plan.price.monthly) > 0 && (
            <div className="mt-1 text-sm text-gray-500">
              {billingCycle === '6months' ? (
                <span>Save 10% compared to monthly billing</span>
              ) : (
                <span>Save 20% compared to monthly billing</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
          {currentUser?.email && (
            <span className="text-xs text-gray-500 ml-2">(from your account)</span>
          )}
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="you@example.com"
          required
          disabled={!!currentUser?.email}
        />
        {currentUser?.email && (
          <p className="mt-1 text-xs text-gray-500">
            Using your account email. To change it, update your profile settings.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-start">
          <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={!stripe || loading || !email}
          className="w-full justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting to checkout...
            </>
          ) : (
            `Continue to Checkout`
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full"
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
      
      {plan.key === 'free' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> A credit card is required for the free plan to prevent abuse and ensure account security. 
            No charges will be made to your card for the free plan.
          </p>
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time.
      </p>
      <p className="text-xs text-gray-500 text-center">
        You'll be redirected to Stripe's secure checkout page to complete your payment.
        {plan.key === 'free' && ' A payment method is required but no charges will be made.'}
      </p>
    </form>
  );
}
