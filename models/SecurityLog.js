
const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  description: String,
  ip_address: String,
  user_agent: String
}, { timestamps: true });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
