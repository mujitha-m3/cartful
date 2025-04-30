const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// GET /cart
exports.viewCart = async (req, res) => {
    try {
      let cart = await Cart.findOne({ user_id: req.user._id });
  
      // If user has no cart yet
      if (!cart) {
        return res.render('cart', { cartItems: [] });
      }
  
      const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
  
      res.render('cart', { cartItems: items });
    } catch (error) {
      console.error("Error loading cart:", error);
      res.status(500).send("Error loading cart");
    }
  };

  exports.addToCart = async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(product_id)) {
        return res.status(400).json({ success: false, message: 'Invalid product ID.' });
      }
  
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
  
      const qty = parseInt(quantity) || 1;
      const unit_price = product.price;
      const total_price = unit_price * qty;
  
      let cart = await Cart.findOne({ user_id: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user_id: req.user._id });
      }
  
      let item = await CartItem.findOne({ cart_id: cart._id, product_id });
      if (item) {
        item.quantity += qty;
        item.total_price = item.quantity * unit_price;
      } else {
        item = new CartItem({
          cart_id: cart._id,
          product_id,
          quantity: qty,
          unit_price,
          total_price
        });
      }
  
      await item.save();
  
      // Return JSON for AJAX or fallback to redirect if needed
      if (req.headers['content-type']?.includes('application/json') || req.xhr) {
        return res.json({ success: true, message: '✅ Item added to cart!' });
      } else {
        req.flash('success_msg', '✅ Item added to cart!');
        return res.redirect('/');
      }
  
    } catch (err) {
      console.error('Add to cart error:', err);
      return res.status(500).json({ success: false, message: 'Server error adding to cart.' });
    }
  };

  
  

exports.removeFromCart = async (req, res) => {
  await CartItem.findByIdAndDelete(req.params.id);
  res.redirect('/cart');
};

exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const item = await CartItem.findById(req.params.id);
  item.quantity = quantity;
  item.total_price = item.unit_price * quantity;
  await item.save();
  res.redirect('/cart');
};
