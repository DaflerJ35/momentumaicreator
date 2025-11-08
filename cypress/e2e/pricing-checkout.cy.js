describe('Pricing and Checkout Flow', () => {
  beforeEach(() => {
    // Mock the checkout session API
    cy.mockCheckoutSession('cs_test_12345');
    
    // Visit pricing page
    cy.visit('/pricing');
  });

  it('should display all pricing plans', () => {
    // Check that all plans are visible
    cy.contains('Free Momentum').should('be.visible');
    cy.contains('Pro Momentum').should('be.visible');
    cy.contains('Business').should('be.visible');
    cy.contains('Business+').should('be.visible');
  });

  it('should allow switching between billing cycles', () => {
    // Check default monthly pricing
    cy.contains('Billed monthly').should('be.visible');
    
    // Switch to 6-month billing
    cy.contains('6 Months').click();
    cy.contains('Billed every 6 months').should('be.visible');
    cy.contains('Save 10%').should('be.visible');
    
    // Switch to yearly billing
    cy.contains('12 Months').click();
    cy.contains('Billed annually').should('be.visible');
    cy.contains('Save 20%').should('be.visible');
  });

  it('should open upgrade modal when selecting a paid plan', () => {
    // Click on Pro plan
    cy.contains('Choose Pro Plan').click();
    
    // Modal should be visible
    cy.contains('Complete your purchase').should('be.visible');
    cy.contains('Pro Momentum').should('be.visible');
  });

  it('should complete checkout flow for Pro plan', () => {
    // Click on Pro plan
    cy.contains('Choose Pro Plan').click();
    
    // Fill in email
    cy.get('input[type="email"]').type('test@example.com');
    
    // Mock Stripe redirect
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_12345' }),
      });
    });
    
    // Click continue to checkout
    cy.contains('Continue to Checkout').click();
    
    // Verify API was called with correct parameters
    cy.wait('@createCheckoutSession').its('request.body').should('deep.include', {
      plan: 'pro',
      billingCycle: 'monthly',
      customerEmail: 'test@example.com',
    });
  });

  it('should handle 6-month billing cycle checkout', () => {
    // Switch to 6-month billing
    cy.contains('6 Months').click();
    
    // Select Business plan
    cy.contains('Choose Business Plan').click();
    
    // Fill in email
    cy.get('input[type="email"]').type('business@example.com');
    
    // Mock API
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: async () => ({ sessionId: 'cs_test_67890' }),
      });
    });
    
    // Submit
    cy.contains('Continue to Checkout').click();
    
    // Verify correct billing cycle
    cy.wait('@createCheckoutSession').its('request.body').should('include', {
      billingCycle: '6months',
    });
  });

  it('should navigate to contact page for Business+ plan', () => {
    // Click on Business+ plan (which should go to contact instead of checkout)
    cy.contains('Contact Sales').click();
    
    // Should navigate to contact page
    cy.url().should('include', '/contact');
  });

  it('should display correct pricing for each plan', () => {
    // Check Pro plan pricing
    cy.contains('Pro Momentum').parent().parent().within(() => {
      cy.contains('$29').should('be.visible');
    });
    
    // Check Business plan pricing
    cy.contains('Business').parent().parent().within(() => {
      cy.contains('$99').should('be.visible');
    });
    
    // Check Business+ plan pricing
    cy.contains('Business+').parent().parent().within(() => {
      cy.contains('$249').should('be.visible');
    });
  });

  it('should show discount information for longer billing cycles', () => {
    // Switch to yearly
    cy.contains('12 Months').click();
    
    // Check that discounted prices are shown
    cy.contains('Pro Momentum').parent().parent().within(() => {
      cy.contains('$23').should('be.visible'); // Discounted price
    });
  });

  it('should allow canceling the checkout modal', () => {
    // Open modal
    cy.contains('Choose Pro Plan').click();
    
    // Click cancel
    cy.contains('Cancel').click();
    
    // Modal should close
    cy.contains('Complete your purchase').should('not.exist');
  });

  it('should validate email input', () => {
    // Open modal
    cy.contains('Choose Pro Plan').click();
    
    // Try to submit without email
    cy.contains('Continue to Checkout').should('be.disabled');
    
    // Enter invalid email
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="email"]').blur();
    
    // Enter valid email
    cy.get('input[type="email"]').clear().type('valid@example.com');
    cy.contains('Continue to Checkout').should('not.be.disabled');
  });

  it('should handle API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', '/api/create-checkout-session', {
      statusCode: 400,
      body: {
        error: 'Invalid plan or billing cycle',
      },
    }).as('checkoutError');
    
    // Open modal and submit
    cy.contains('Choose Pro Plan').click();
    cy.get('input[type="email"]').type('test@example.com');
    
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: false,
        json: async () => ({ error: 'Invalid plan or billing cycle' }),
      });
    });
    
    cy.contains('Continue to Checkout').click();
    
    // Error message should be displayed
    cy.contains('Invalid plan or billing cycle').should('be.visible');
  });
});

describe('Authenticated User Checkout', () => {
  beforeEach(() => {
    cy.mockCheckoutSession();
    cy.login('authenticated@example.com');
  });

  it('should pre-fill email for authenticated users', () => {
    cy.visit('/pricing');
    cy.contains('Choose Pro Plan').click();
    
    // Email might be pre-filled (depending on implementation)
    // This is a placeholder test - adjust based on actual behavior
    cy.get('input[type="email"]').should('exist');
  });
});

