const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  first_name: { type: String, required: true },  // Add this
  last_name: { type: String, required: true },   // Add this
  email: { type: String, required: true },
  phone: { type: String, required: true }, // Add required: true here
  total: { type: Number, required: true },
  payment_status: { type: String, default: 'unpaid' },
  order_status: { type: String, default: 'Pending' },
  payment_method: { type: String },
  payment_reference: { type: String },
  tracking_number: { type: String },

  email: { type: String, required: true }, // 🚀 ADDED: Customer email (required)

  shipping_address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    postal: { type: String },
    country: { type: String }
  },
  billing_address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    postal: { type: String },
    country: { type: String }
  },

  shipping_method: { type: String },
  placed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
