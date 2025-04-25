const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderProduct = require('../models/OrderProduct');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Show checkout page
exports.checkoutPage = async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) return res.redirect('/cart');

  const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');

  let total = 0;
  for (let item of items) total += item.total_price;

  res.render('checkout', {
    cartItems: items,
    total: total.toFixed(2),
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    session: req.session,
    success_msg: req.flash('success_msg'),
    error_msg: req.flash('error_msg'),
    activeTab: req.query.tab || 'details'
  });
};

// Save customer order details into session
exports.saveCheckoutDetails = (req, res) => {
  const {
    first_name, last_name, phone, email,
    shipping_address, billing_address,
    shipping_method
  } = req.body;

  req.session.checkoutDetails = {
    first_name,
    last_name,
    phone,
    email,
    shipping_address,
    billing_address,
    shipping_method
  };

  req.flash('success_msg', '✅ Order details saved successfully!');
  res.redirect('/checkout?tab=shipping');
};

// Place order (Stripe or COD)
exports.createOrder = async (req, res) => {
  const { payment_method } = req.body;
  const checkoutDetails = req.session.checkoutDetails;
  if (!checkoutDetails) {
    req.flash('error_msg', 'Please save order details first.');
    return res.redirect('/checkout');
  }

  const cart = await Cart.findOne({ user_id: req.user._id });
  const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');

  let total = 0;
  for (let item of items) total += item.total_price;

  // Stripe Payment Flow
  if (payment_method === 'stripe') {
    const order = await Order.create({
      user_id: req.user._id,
      total,
      payment_status: 'pending',
      order_status: 'Pending',
      payment_method: 'stripe',
      shipping_method: checkoutDetails.shipping_method,
      shipping_address: checkoutDetails.shipping_address,
      billing_address: checkoutDetails.billing_address,
      placed_by: req.user._id,
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

    req.session.stripe_order_id = order._id;

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

  // COD Flow
  const order = await Order.create({
    user_id: req.user._id,
    total,
    payment_status: 'unpaid',
    order_status: 'Confirmed',
    payment_method: 'cod',
    shipping_method: checkoutDetails.shipping_method,
    shipping_address: checkoutDetails.shipping_address,
    billing_address: checkoutDetails.billing_address,
    placed_by: req.user._id,
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

  await Payment.create({
    order_id: order._id,
    transaction_id: `COD-${order._id.toString().slice(-6)}`,
    method: 'cod',
    amount: total,
    currency: 'eur',
    status: 'pending',
    paid_at: null,
    provider_response: 'Waiting for cash on delivery'
  });

  await CartItem.deleteMany({ cart_id: cart._id });
  req.session.checkoutDetails = null;

  res.redirect('/checkout/success');
};

// After Stripe payment
exports.checkoutSuccess = async (req, res) => {
  try {
    const orderId = req.session.stripe_order_id;
    if (!orderId) return res.redirect('/');

    const order = await Order.findById(orderId);
    if (!order) return res.redirect('/');

    order.payment_status = 'paid';
    order.order_status = 'Confirmed';
    await order.save();

    await Payment.create({
      order_id: order._id,
      transaction_id: `STRIPE-${order._id.toString().slice(-6)}`,
      method: 'stripe',
      amount: order.total,
      currency: 'eur',
      status: 'success',
      paid_at: new Date(),
      provider_response: 'Stripe payment success'
    });

    const cart = await Cart.findOne({ user_id: req.user._id });
    await CartItem.deleteMany({ cart_id: cart._id });

    req.session.checkoutDetails = null;
    req.session.stripe_order_id = null;

    res.render('checkout-success', {
      orderId: order._id,
      total: order.total.toFixed(2),
      success_msg: '🎉 Payment successful!'
    });

  } catch (err) {
    console.error('❌ Payment success error:', err);
    res.redirect('/');
  }
};
