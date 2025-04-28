const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const OrderProduct = require('../models/OrderProduct');
const Payment = require('../models/Payment');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendEmail } = require('../utils/sendEmail');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Show checkout page
exports.checkoutPage = async (req, res) => {
  try {
    // Get the user's cart
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) return res.redirect('/cart');

    // Get the items in the cart
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    // Render the checkout page with the required details
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
  try {
    const { email, first_name, last_name, phone, shipping_address, billing_address, shipping_method } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      req.flash('error_msg', 'Please enter a valid email address');
      return res.redirect('/checkout?tab=details');
    }

    // Validate names
    if (!first_name || !last_name) {
      req.flash('error_msg', 'Please enter both first and last name');
      return res.redirect('/checkout?tab=details');
    }

    // Save checkout details to session
    req.session.checkoutDetails = {
      email,
      first_name,  
      last_name,    
      phone,
      shipping_address,
      billing_address,
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

// Place order (Stripe or COD)
exports.createOrder = async (req, res) => {
  try {
    const { payment_method } = req.body;
    const checkoutDetails = req.session.checkoutDetails;

    if (!checkoutDetails) {
      req.flash('error_msg', 'Please save order details first.');
      return res.redirect('/checkout');
    }

    // Get the cart and items
    const cart = await Cart.findOne({ user_id: req.user._id });
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    // Common order data
    const orderData = {
      user_id: req.user._id,
      total,
      payment_method,
      shipping_method: checkoutDetails.shipping_method,
      shipping_address: checkoutDetails.shipping_address,
      billing_address: checkoutDetails.billing_address,
      placed_by: req.user._id,
      email: checkoutDetails.email,
      phone: checkoutDetails.phone || 'Not provided',
      first_name: checkoutDetails.first_name,
      last_name: checkoutDetails.last_name,
    };

    // Stripe flow
    if (payment_method === 'stripe') {
      const order = await Order.create({
        ...orderData,
        payment_status: 'pending',
        order_status: 'Pending',
      });

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
      });

      return res.redirect(session.url);
    }

    // COD Flow
    const order = await Order.create({
      ...orderData,
      payment_status: 'unpaid',
      order_status: 'Confirmed',
      payment_method: 'cod',
    });

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

    // Create payment for COD
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

    const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    const phoneDisplay = order.phone || 'Not provided';

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
          ${checkoutDetails.shipping_address.line1}<br>
          ${checkoutDetails.shipping_address.line2 ? checkoutDetails.shipping_address.line2 + '<br>' : ''}
          ${checkoutDetails.shipping_address.city}<br>
          ${checkoutDetails.shipping_address.postal}<br>
          ${checkoutDetails.shipping_address.country}
        </p>
        
        <p>We are preparing your items and will ship them soon!</p>
        <p>Please find your receipt attached.</p>
        <br><p>Cartful Team</p>
      `,
      order,
      items,
      user: req.user,
      paymentMethod: 'cod',
    });

    // Generate PDF Receipt
    const doc = new PDFDocument();
    const filePath = `./receipts/order_${order._id}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(16).text(`Order Receipt #${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Phone: ${order.phone || 'Not provided'}`);
    doc.text(`Payment Method: Cash On Delivery`);
    doc.text(`Total Amount: €${order.total.toFixed(2)}`);

    // Shipping Address
    doc.text(`Shipping Address:`);
    doc.text(`${checkoutDetails.shipping_address.line1}`);
    if (checkoutDetails.shipping_address.line2) {
      doc.text(`${checkoutDetails.shipping_address.line2}`);
    }
    doc.text(`${checkoutDetails.shipping_address.city}`);
    doc.text(`${checkoutDetails.shipping_address.postal}`);
    doc.text(`${checkoutDetails.shipping_address.country}`);

    doc.end();

    res.redirect('/checkout/success');
  } catch (error) {
    console.error('Create order error:', error);
    req.flash('error_msg', 'Error processing your order');
    res.redirect('/checkout');
  }
};

// After Stripe payment success
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
      provider_response: 'Stripe payment success',
    });

    // Empty cart after successful payment
    const cart = await Cart.findOne({ user_id: req.user._id });
    const items = await CartItem.find({ cart_id: cart._id }).populate('product_id');
    await CartItem.deleteMany({ cart_id: cart._id });

    req.session.checkoutDetails = null;
    req.session.stripe_order_id = null;

    // Send payment receipt email
    await sendEmail({
      recipient: order.email,
      subject: 'Payment Receipt - Cartful',
      htmlContent: `
        <h2>Hi ${order.first_name} ${order.last_name}!</h2>
        <p>We received your payment for order <b>#${order._id}</b>.</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Phone:</strong> ${order.phone || 'Not provided'}</p>
        <p><strong>Total Paid:</strong> €${order.total.toFixed(2)}</p>
        <p>We are now preparing your shipment. </p>
        <p>Please find your payment receipt attached.</p>
        <br><p> Cartful Team</p>
      `,
      order,
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
