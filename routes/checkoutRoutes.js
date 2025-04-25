const express = require('express');
const router = express.Router();
const {
  checkoutPage,
  createOrder,
  checkoutSuccess,
  saveCheckoutDetails
} = require('../controllers/checkoutController');

// Show checkout form
router.get('/', checkoutPage);

// Save details temporarily before payment
router.post('/save-details', saveCheckoutDetails);

// Finalize order (only allowed after payment confirmed)
router.post('/', createOrder);

// Show success page after payment
router.get('/success', checkoutSuccess);

module.exports = router;
