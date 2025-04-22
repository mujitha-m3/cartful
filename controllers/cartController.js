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
  const { product_id, quantity } = req.body;
  const product = await Product.findById(product_id);
  const unit_price = product.price;
  const total_price = unit_price * quantity;

  let cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user_id: req.user._id });
  }

  let item = await CartItem.findOne({ cart_id: cart._id, product_id });
  if (item) {
    item.quantity += quantity;
    item.total_price = item.quantity * unit_price;
  } else {
    item = new CartItem({ cart_id: cart._id, product_id, quantity, unit_price, total_price });
  }
  await item.save();
  res.redirect('/cart');
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
