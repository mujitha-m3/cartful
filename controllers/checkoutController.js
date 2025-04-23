const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderProduct = require('../models/OrderProduct');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.checkoutPage = async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id });
  const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');

  let total = 0;
  for (let item of items) {
    total += item.total_price;
  }

  res.render('checkout', {
    cartItems: items,
    total: total.toFixed(2),
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY
  });
};

exports.createOrder = async (req, res) => {
  const { payment_method } = req.body;
  const cart = await Cart.findOne({ user_id: req.user._id });
  const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');

  let total = 0;
  for (let item of items) {
    total += item.total_price;
  }

  if (payment_method === 'stripe') {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.product_id.name },
          unit_amount: Math.round(item.unit_price * 100),
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout',
    });
    return res.redirect(session.url);
  }

  const order = await Order.create({
    user_id: req.user._id,
    total,
    payment_status: 'paid',
    order_status: 'Confirmed',
    payment_method,
    created_at: new Date()
  });

  for (let item of items) {
    await OrderProduct.create({
      order_id: order._id,
      product_id: item.product_id._id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    });
  }

  await CartItem.deleteMany({ cart_id: cart._id });

  res.redirect('/checkout/success');
};

exports.checkoutSuccess = (req, res) => {
  res.render('checkout-success');
};
