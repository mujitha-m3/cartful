const express = require('express');
const router = express.Router();
const {
  checkoutPage,
  createOrder,
  checkoutSuccess,
  saveCheckoutDetails,
  confirmOrder,
  confirmCheckout,
  createStripeSession
} = require('../controllers/checkoutController');
const { ensureAuthenticated } = require('../middleware/auth');

// Protect all checkout routes with authentication
router.use(ensureAuthenticated);

// Show checkout form
router.get('/', checkoutPage);

// Save details temporarily before payment
router.post('/save-details', saveCheckoutDetails);

// Handle COD payments
router.post('/place-order', createOrder);

// Handle Stripe payments
router.post('/stripe', createStripeSession);

// Show success page after payment
router.get('/success', checkoutSuccess);

// Show confirmation page before placing the order
router.post('/confirm', confirmOrder);

module.exports = router;
