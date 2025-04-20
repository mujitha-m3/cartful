
const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  unit_price: Number,
  discount_applied: Number,
  total_price: Number
});

module.exports = mongoose.model('OrderProduct', orderProductSchema);
