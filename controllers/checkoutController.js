const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderProduct = require('../models/OrderProduct');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendEmail } = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const userController = require('./userController');

// Show checkout page
exports.checkoutPage = async (req, res) => {
  try {
    if (!req.user || req.user.isGuest) {
      req.flash('error_msg', 'Please log in to proceed with checkout.');
      return res.redirect('/login');
    }

    // Get the user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.redirect('/cart');

    // Get the items in the cart
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    if (req.user && !req.session.checkoutDetails) {
      const userPrefill = await userController.getUserDetailsForCheckout(req.user._id);
      if (userPrefill) {
        req.session.checkoutDetails = userPrefill;
      }
    }

    res.render('checkout', {
      cartItems: items,
      total: total.toFixed(2),
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      session: req.session,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg'),
      activeTab: req.query.tab || 'details',
    });
  } catch (error) {
    console.error('Checkout page error:', error);
    req.flash('error_msg', 'Error loading checkout page');
    res.redirect('/cart');
  }
};

// Save customer order details into session
exports.saveCheckoutDetails = (req, res) => {
  if (!req.user || req.user.isGuest) {
    req.flash('error_msg', 'Please log in to proceed with checkout.');
    return res.redirect('/login');
  }
  try {
    const {
      email,
      first_name,
      last_name,
      phone,
      shipping_line1,
      shipping_line2,
      shipping_city,
      shipping_postal,
      shipping_country,
      billing_line1,
      billing_line2,
      billing_city,
      billing_postal,
      billing_country,
      shipping_method,
    } = req.body;

    // Save checkout details to session with properly structured addresses
    req.session.checkoutDetails = {
      email,
      first_name,
      last_name,
      phone,
      shipping_address: {
        line1: shipping_line1,
        line2: shipping_line2 || '',
        city: shipping_city,
        postal: shipping_postal,
        country: shipping_country || 'Finland'
      },
      billing_address: {
        line1: billing_line1,
        line2: billing_line2 || '',
        city: billing_city,
        postal: billing_postal,
        country: billing_country || 'Finland'
      },
      shipping_method,
    };

    req.flash('success_msg', 'Order details saved successfully!');
    res.redirect('/checkout?tab=shipping');
  } catch (err) {
    console.error('Save checkout details error:', err);
    req.flash('error_msg', 'Error saving order details');
    res.redirect('/checkout');
  }
};

exports.confirmOrder = async (req, res) => {
  if (!req.user || req.user.isGuest) {
    req.flash('error_msg', 'Please log in to proceed with checkout.');
    return res.redirect('/login');
  }
  const {
    firstName, lastName, phone,
    shippingStreet, shippingPostal, shippingCity,
    shippingMethod, paymentMethod
  } = req.body;

  const cartItems = await getCartItems(req.user._id);

  const shippingFees = {
    Posti: 4.90,
    Matkahuolto: 5.90,
    Pickup: 0
  };

  const shippingFee = shippingFees[shippingMethod] || 0;
  let subtotal = 0;
  cartItems.forEach(item => {
    subtotal += item.quantity * item.product.price;
  });

  const total = subtotal + shippingFee;

  // Save to session for later
  req.session.checkout = {
    firstName, lastName, phone,
    shippingStreet, shippingPostal, shippingCity,
    shippingMethod, paymentMethod,
    shippingFee, subtotal, total
  };

  res.render('checkout-confirm', {
    firstName, lastName, phone,
    address: {
      street: shippingStreet,
      postal: shippingPostal,
      city: shippingCity
    },
    shippingMethod,
    paymentMethod,
    shippingFee: shippingFee.toFixed(2),
    subtotal: subtotal.toFixed(2),
    total: total.toFixed(2),
    cart: cartItems
  });
};

// Handle COD orders only
exports.createOrder = async (req, res) => {
  if (!req.user || req.user.isGuest) {
    req.flash('error_msg', 'Please log in to proceed with checkout.');
    return res.redirect('/login');
  }
  try {
    const payment_method = req.body.payment_method || req.body.paymentMethod;
    if (payment_method !== 'cod') {
      req.flash('error_msg', 'Invalid payment method');
      return res.redirect('/checkout');
    }

    const checkoutDetails = req.session.checkoutDetails;
    const checkoutSession = req.session.checkout;
    
    if (!checkoutDetails || !checkoutSession) {
      req.flash('error_msg', 'Checkout details are missing. Please try again.');
      return res.redirect('/checkout');
    }

    // Merge shipping address from both sources
    const shippingAddress = {
      line1: checkoutSession.shippingStreet || checkoutDetails.shipping_address.line1,
      line2: checkoutDetails.shipping_address.line2 || '',
      city: checkoutSession.shippingCity || checkoutDetails.shipping_address.city,
      postal: checkoutSession.shippingPostal || checkoutDetails.shipping_address.postal,
      country: checkoutDetails.shipping_address.country || 'Finland'
    };

    const cart = await Cart.findOne({ user_id: req.user._id });
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    const orderData = {
      user_id: req.user._id,
      total,
      payment_method: 'cod',
      shipping_method: checkoutSession.shippingMethod || checkoutDetails.shipping_method,
      shipping_address: shippingAddress,
      billing_address: checkoutDetails.billing_address,
      placed_by: req.user._id,
      email: checkoutDetails.email,
      phone: checkoutSession.phone || checkoutDetails.phone || 'Not provided',
      first_name: checkoutSession.firstName || checkoutDetails.first_name,
      last_name: checkoutSession.lastName || checkoutDetails.last_name,
      payment_status: 'unpaid',
      order_status: 'Confirmed'
    };

    const order = await Order.create(orderData);

    // Create order products for COD
    for (let item of items) {
      await OrderProduct.create({
        order_id: order._id,
        product_id: item.product_id._id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      });
    }

    // Create payment record for COD
    await Payment.create({
      order_id: order._id,
      transaction_id: `COD-${order._id.toString().slice(-6)}`,
      method: 'cod',
      amount: total,
      currency: 'eur',
      status: 'pending',
      paid_at: null,
      provider_response: 'Waiting for cash on delivery',
    });

    // Empty cart
    await CartItem.deleteMany({ cart_id: cart._id });
    req.session.checkoutDetails = null;
    req.session.checkout = null;

    // Send confirmation email
    await sendEmail({
      recipient: order.email,
      subject: 'Order Confirmation - Cartful',
      htmlContent: `
        <h2>Hi ${order.first_name} ${order.last_name}!</h2>
        <p>Thank you for your order <b>#${order._id}</b>!</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
        <p><strong>Payment Method:</strong> Cash On Delivery</p>
        <p><strong>Total Amount:</strong> €${order.total.toFixed(2)}</p>

        <h4>Shipping Address:</h4>
        <p>
          ${shippingAddress.line1}<br>
          ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
          ${shippingAddress.city}<br>
          ${shippingAddress.postal}<br>
          ${shippingAddress.country}
        </p>
        
        <p>We are preparing your items and will ship them soon!</p>
        <p>Please find your receipt attached.</p>
        <br><p>Cartful Team</p>
      `,
      order: {
        ...order.toObject(),
        shipping_address: shippingAddress
      },
      items,
      user: req.user,
      paymentMethod: 'cod',
    });

    // Store COD order id for success redirect
    req.session.cod_order_id = order._id;

    res.redirect('/checkout/success');
  } catch (error) {
    console.error('Create order error:', error);
    req.flash('error_msg', 'Error processing your order');
    res.redirect('/checkout');
  }
};

// Handle Stripe payments
exports.createStripeSession = async (req, res) => {
  if (!req.user || req.user.isGuest) {
    req.flash('error_msg', 'Please log in to proceed with checkout.');
    return res.redirect('/login');
  }
  try {
    const payment_method = req.body.payment_method || req.body.paymentMethod;
    if (payment_method !== 'stripe') {
      req.flash('error_msg', 'Invalid payment method');
      return res.redirect('/checkout');
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is not configured');
      req.flash('error_msg', 'Payment configuration error');
      return res.redirect('/checkout');
    }

    const checkoutDetails = req.session.checkoutDetails;
    const checkoutSession = req.session.checkout;
    
    if (!checkoutDetails || !checkoutSession) {
      req.flash('error_msg', 'Checkout details are missing. Please try again.');
      return res.redirect('/checkout');
    }

    // Merge shipping address from both sources
    const shippingAddress = {
      line1: checkoutSession.shippingStreet || checkoutDetails.shipping_address.line1,
      line2: checkoutDetails.shipping_address.line2 || '',
      city: checkoutSession.shippingCity || checkoutDetails.shipping_address.city,
      postal: checkoutSession.shippingPostal || checkoutDetails.shipping_address.postal,
      country: checkoutDetails.shipping_address.country || 'Finland'
    };

    const cart = await Cart.findOne({ user_id: req.user._id });
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    const orderData = {
      user_id: req.user._id,
      total,
      payment_method: 'stripe',
      shipping_method: checkoutSession.shippingMethod || checkoutDetails.shipping_method,
      shipping_address: shippingAddress,
      billing_address: checkoutDetails.billing_address,
      placed_by: req.user._id,
      email: checkoutDetails.email,
      phone: checkoutSession.phone || checkoutDetails.phone || 'Not provided',
      first_name: checkoutSession.firstName || checkoutDetails.first_name,
      last_name: checkoutSession.lastName || checkoutDetails.last_name,
      payment_status: 'pending',
      order_status: 'Pending'
    };

    const order = await Order.create(orderData);

    // Create order products
    for (let item of items) {
      await OrderProduct.create({
        order_id: order._id,
        product_id: item.product_id._id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
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
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
      customer_email: checkoutDetails.email,

      metadata: {
        order_id: order._id.toString()
      }
    });

    return res.redirect(303, session.url);
  } catch (error) {
    console.error('Stripe session creation error:', error);
    req.flash('error_msg', 'Error processing your payment');
    res.redirect('/checkout');
  }
};

// After Stripe payment success
exports.checkoutSuccess = async (req, res) => {
  try {
    if (!req.user || req.user.isGuest) {
      req.flash('error_msg', 'Please log in to proceed with checkout.');
      return res.redirect('/login');
    }

    // Determine order id for Stripe or COD
    const stripeOrder = req.session.stripe_order_id;
    const codOrder = req.session.cod_order_id;
    const orderId = stripeOrder || codOrder;
    if (!orderId) return res.redirect('/');

    const order = await Order.findById(orderId);
    if (!order) return res.redirect('/');

    // Handle COD success (order already created and payment pending)
    if (codOrder && !stripeOrder) {
      // Clear COD session and checkout data
      req.session.cod_order_id = null;
      req.session.checkoutDetails = null;
      req.session.checkout = null;

      return res.render('checkout-success', {
        orderId: order._id,
        total: order.total.toFixed(2),
        success_msg: 'Your order has been placed! Please pay on delivery.'
      });
    }

    // Stripe success flow
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
      provider_response: 'Stripe payment success',
    });

    // Empty cart after successful payment
    const cart = await Cart.findOne({ user_id: req.user._id });
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    await CartItem.deleteMany({ cart_id: cart._id });

    req.session.checkoutDetails = null;
    req.session.checkout = null;
    req.session.stripe_order_id = null;

    // Send payment receipt email
    await sendEmail({
      recipient: order.email,
      subject: 'Order Confirmation - Cartful',
      htmlContent: `
        <h2>Hi ${order.first_name} ${order.last_name}!</h2>
        <p>Thank you for your order <b>#${order._id}</b>!</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
        <p><strong>Payment Method:</strong> Credit Card (Stripe)</p>
        <p><strong>Total Amount:</strong> €${order.total.toFixed(2)}</p>

        <h4>Shipping Address:</h4>
        <p>
          ${order.shipping_address.line1}<br>
          ${order.shipping_address.line2 ? order.shipping_address.line2 + '<br>' : ''}
          ${order.shipping_address.city}<br>
          ${order.shipping_address.postal}<br>
          ${order.shipping_address.country}
        </p>
        
        <p>We are preparing your items and will ship them soon!</p>
        <p>Please find your receipt attached.</p>
        <br><p>Cartful Team</p>
      `,
      order: order.toObject(),
      items,
      user: req.user,
      paymentMethod: 'stripe',
    });

    res.render('checkout-success', {
      orderId: order._id,
      total: order.total.toFixed(2),
      success_msg: 'Payment successful!',
    });
  } catch (err) {
    console.error('Payment success error:', err);
    req.flash('error_msg', 'Error finalizing your payment');
    res.redirect('/');
  }
};

async function getCartItems(userId) {
  try {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return [];

    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    return items.map(item => ({
      product: item.product_id,
      quantity: item.quantity,
      total_price: item.total_price
    }));
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }
}