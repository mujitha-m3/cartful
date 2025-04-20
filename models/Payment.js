
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  transaction_id: String,
  method: String,
  amount: Number,
  currency: String,
  status: String,
  paid_at: Date,
  provider_response: String
});

module.exports = mongoose.model('Payment', paymentSchema);
