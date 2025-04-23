const express = require('express');
const router = express.Router();
const { checkoutPage, createOrder, checkoutSuccess } = require('../controllers/checkoutController');

router.get('/', checkoutPage);
router.post('/', createOrder);
router.get('/success', checkoutSuccess);

module.exports = router;
