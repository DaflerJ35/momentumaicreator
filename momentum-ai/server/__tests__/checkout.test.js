const request = require('supertest');
const express = require('express');
const { describe, it, expect, beforeAll, afterAll, vi } = require('@jest/globals');

// Mock Stripe
const mockCreate = vi.fn();
jest.mock('stripe', () => {
  return vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }));
});

describe('Checkout Session API', () => {
  let app;
  
  beforeAll(() => {
    // Set up test environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
    process.env.STRIPE_MONTHLY_PRO_PRICE_ID = 'price_test_monthly_pro';
    process.env.STRIPE_MONTHLY_BUSINESS_PRICE_ID = 'price_test_monthly_business';
    process.env.STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID = 'price_test_monthly_business_plus';
    process.env.STRIPE_6MONTH_PRO_PRICE_ID = 'price_test_6month_pro';
    process.env.STRIPE_6MONTH_BUSINESS_PRICE_ID = 'price_test_6month_business';
    process.env.STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID = 'price_test_6month_business_plus';
    process.env.STRIPE_YEARLY_PRO_PRICE_ID = 'price_test_yearly_pro';
    process.env.STRIPE_YEARLY_BUSINESS_PRICE_ID = 'price_test_yearly_business';
    process.env.STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID = 'price_test_yearly_business_plus';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());

    // Simplified checkout endpoint for testing
    const PRICE_IDS = {
      monthly: {
        pro: process.env.STRIPE_MONTHLY_PRO_PRICE_ID,
        business: process.env.STRIPE_MONTHLY_BUSINESS_PRICE_ID,
        businessPlus: process.env.STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID,
      },
      '6months': {
        pro: process.env.STRIPE_6MONTH_PRO_PRICE_ID,
        business: process.env.STRIPE_6MONTH_BUSINESS_PRICE_ID,
        businessPlus: process.env.STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID,
      },
      '12months': {
        pro: process.env.STRIPE_YEARLY_PRO_PRICE_ID,
        business: process.env.STRIPE_YEARLY_BUSINESS_PRICE_ID,
        businessPlus: process.env.STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID,
      }
    };

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    app.post('/api/create-checkout-session', async (req, res) => {
      const { plan, billingCycle, customerEmail } = req.body;
      
      try {
        const priceId = PRICE_IDS[billingCycle]?.[plan];
        
        if (!priceId) {
          return res.status(400).json({ error: 'Invalid plan or billing cycle' });
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          mode: 'subscription',
          automatic_tax: { enabled: true },
          success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
          customer_email: customerEmail,
          metadata: { plan, billing_cycle: billingCycle }
        });

        res.json({ sessionId: session.id });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create checkout session' });
      }
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockCreate.mockReset();
  });

  describe('POST /api/create-checkout-session', () => {
    it('should create a checkout session for pro monthly plan', async () => {
      mockCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const response = await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'pro',
          billingCycle: 'monthly',
          customerEmail: 'test@example.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('sessionId');
      expect(response.body.sessionId).toBe('cs_test_123');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer_email: 'test@example.com',
          metadata: {
            plan: 'pro',
            billing_cycle: 'monthly',
          },
        })
      );
    });

    it('should create a checkout session for business 6-month plan', async () => {
      mockCreate.mockResolvedValue({
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      });

      const response = await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'business',
          billingCycle: '6months',
          customerEmail: 'business@example.com',
        })
        .expect(200);

      expect(response.body.sessionId).toBe('cs_test_456');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: 'price_test_6month_business',
              quantity: 1,
            },
          ],
        })
      );
    });

    it('should create a checkout session for businessPlus yearly plan', async () => {
      mockCreate.mockResolvedValue({
        id: 'cs_test_789',
        url: 'https://checkout.stripe.com/pay/cs_test_789',
      });

      const response = await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'businessPlus',
          billingCycle: '12months',
          customerEmail: 'enterprise@example.com',
        })
        .expect(200);

      expect(response.body.sessionId).toBe('cs_test_789');
    });

    it('should return 400 for invalid plan', async () => {
      const response = await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'invalid_plan',
          billingCycle: 'monthly',
          customerEmail: 'test@example.com',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid plan or billing cycle');
    });

    it('should return 400 for invalid billing cycle', async () => {
      const response = await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'pro',
          billingCycle: 'invalid_cycle',
          customerEmail: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid plan or billing cycle');
    });

    it('should return 500 when Stripe API fails', async () => {
      mockCreate.mockRejectedValue(new Error('Stripe API Error'));

      const response = await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'pro',
          billingCycle: 'monthly',
          customerEmail: 'test@example.com',
        })
        .expect(500);

      expect(response.body.error).toBe('Failed to create checkout session');
    });

    it('should include correct success and cancel URLs', async () => {
      mockCreate.mockResolvedValue({
        id: 'cs_test_urls',
        url: 'https://checkout.stripe.com/pay/cs_test_urls',
      });

      await request(app)
        .post('/api/create-checkout-session')
        .send({
          plan: 'pro',
          billingCycle: 'monthly',
          customerEmail: 'test@example.com',
        })
        .expect(200);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('/dashboard?payment=success'),
          cancel_url: expect.stringContaining('/pricing?payment=cancelled'),
        })
      );
    });
  });
});

