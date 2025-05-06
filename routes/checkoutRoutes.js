const { confirmOrder, confirmCheckout } = require('../controllers/checkoutController');
const express = require('express');
const router = express.Router();
const {
  checkoutPage,
  createOrder,
  checkoutSuccess,
  saveCheckoutDetails
} = require('../controllers/checkoutController');
const { ensureAuthenticated } = require('../middleware/auth');

// Protect all checkout routes with authentication
router.use(ensureAuthenticated);

// Show checkout form
router.get('/', checkoutPage);

// Save details temporarily before payment
router.post('/save-details', saveCheckoutDetails);

// Finalize order (only allowed after payment confirmed)
router.post('/', createOrder);

// Show success page after payment
router.get('/success', checkoutSuccess);

// Show confirmation page before placing the order
router.post('/confirm', confirmOrder);

module.exports = router;
