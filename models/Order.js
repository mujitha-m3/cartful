const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  total: { type: Number, required: true },
  payment_status: { type: String, default: 'unpaid' },
  order_status: { type: String, default: 'Pending' },
  payment_method: String,
  payment_reference: String,
  tracking_number: String,

  shipping_address: {
    line1: String,
    line2: String,
    city: String,
    postal: String,
    country: String
  },
  billing_address: {
    line1: String,
    line2: String,
    city: String,
    postal: String,
    country: String
  },

  shipping_method: String, 

  placed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
