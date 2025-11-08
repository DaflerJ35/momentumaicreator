import { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CheckoutForm({ plan, billingCycle, onSuccess, onCancel }) {
  const stripe = useStripe();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: plan.key,
          billingCycle: billingCycle,
          customerEmail: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      
      if (stripeError) {
        throw stripeError;
      }
      
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
              {plan.price[billingCycle] === 0 ? 'Free' : `$${plan.price[billingCycle]}`}
              {plan.price[billingCycle] > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  {billingCycle === '6months' ? ' every 6 months' : billingCycle === '12months' ? ' per year' : '/month'}
                </span>
              )}
            </span>
          </div>
          {billingCycle !== 'monthly' && plan.price.monthly > 0 && (
            <div className="mt-1 text-sm text-gray-500">
              {billingCycle === '6months' ? (
                <span>Save 10% (${(plan.price.monthly * 6 * 0.1).toFixed(2)}) compared to monthly billing</span>
              ) : (
                <span>Save 20% (${(plan.price.monthly * 12 * 0.2).toFixed(2)}) compared to monthly billing</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="you@example.com"
          required
        />
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
      
      <p className="text-xs text-gray-500 text-center">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time.
      </p>
      <p className="text-xs text-gray-500 text-center">
        You'll be redirected to Stripe's secure checkout page to complete your payment.
      </p>
    </form>
  );
}
