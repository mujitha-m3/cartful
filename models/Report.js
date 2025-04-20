
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: String,
  type: String,
  filters_applied: String,
  generated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file_path: String
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
