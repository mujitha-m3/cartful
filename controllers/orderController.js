const Order = require('../models/Order');

// List all orders for admin
exports.listOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort('-createdAt').lean();
    res.render('admin/orders', { orders });
  } catch (err) {
    next(err);
  }
};

// Render edit form for a single order
exports.editOrderForm = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    res.render('admin/editOrder', { order });
  } catch (err) {
    next(err);
  }
};

// Handle order status update
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { order_status } = req.body;
    await Order.findByIdAndUpdate(req.params.id, { order_status });
    req.flash('success_msg', 'Order status updated');
    res.redirect('/admin/orders');
  } catch (err) {
    next(err);
  }
};