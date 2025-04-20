
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  session_id: String,
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
