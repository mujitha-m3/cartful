
const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  wishlist_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

module.exports = mongoose.model('WishlistItem', wishlistItemSchema);
