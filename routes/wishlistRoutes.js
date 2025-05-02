const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { ensureAuthenticated } = require('../middleware/auth');

// Add to wishlist
router.post('/add/:productId', ensureAuthenticated, wishlistController.addToWishlist);

// Remove from wishlist
router.post('/remove/:productId', ensureAuthenticated, wishlistController.removeFromWishlist);

// View wishlist
router.get('/', ensureAuthenticated, wishlistController.viewWishlist);

module.exports = router;