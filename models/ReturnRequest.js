
const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  return_type: String,
  status: String,
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
