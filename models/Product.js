
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  price: { type: Number, required: true },
  original_price: Number,
  discount: {
    type: {
      type: String,
      value: Number,
      start_date: Date,
      end_date: Date
    },
    default: {}
  },
  stock: Number,
  low_stock_threshold: { type: Number, default: 5 },
  image_url: String,
  thumbnail_url: String,
  alt_text: String,
  is_featured: Boolean,
  status: { type: String, default: 'active' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  allowed_countries: [String],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
