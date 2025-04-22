const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon_url: String,
  parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  restricted_countries: [String],
  localized_names: mongoose.Schema.Types.Mixed,
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Category', categorySchema);
