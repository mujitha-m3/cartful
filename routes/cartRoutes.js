const express = require('express');
const router = express.Router();
const { addToCart, removeFromCart, updateCartItem, viewCart } = require('../controllers/cartController');

// Middleware required: req.user._id from auth
router.get('/', viewCart);
router.post('/add', addToCart);
router.post('/update/:id', updateCartItem);
router.get('/remove/:id', removeFromCart);

module.exports = router;
