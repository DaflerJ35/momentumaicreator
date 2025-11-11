// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to mock Firebase authentication
Cypress.Commands.add('login', (email = 'test@example.com') => {
  cy.window().then((win) => {
    // Mock the Firebase auth state
    const mockUser = {
      uid: 'test-user-id',
      email: email,
      displayName: 'Test User',
      photoURL: null,
    };
    
    // Store user in session storage (if your app uses it)
    win.sessionStorage.setItem('user', JSON.stringify(mockUser));
    
    // You may need to trigger auth state change in your app
    cy.visit('/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
    win.localStorage.clear();
  });
  cy.visit('/');
});

// Custom command to mock API responses
Cypress.Commands.add('mockCheckoutSession', (sessionId = 'cs_test_mock_session') => {
  cy.intercept('POST', '/api/create-checkout-session', {
    statusCode: 200,
    body: {
      sessionId: sessionId,
    },
  }).as('createCheckoutSession');
});

// Custom command to mock Stripe redirect
Cypress.Commands.add('mockStripeRedirect', () => {
  cy.window().then((win) => {
    // Mock Stripe's redirectToCheckout
    if (win.Stripe) {
      win.Stripe = () => ({
        redirectToCheckout: cy.stub().resolves({ error: null }),
      });
    }
  });
});

