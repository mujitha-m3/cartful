const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  price: { type: Number, required: true },
  original_price: Number,
  discount: {
    type: {
      type: String, // e.g., percentage, flat
      value: Number, // e.g., 10 (10% off)
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
  is_featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Assuming Category is another collection
  allowed_countries: [String],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

productSchema.statics.findProductById = async function (id) {
  return await this.findById(id).populate('category_id').exec();
};

productSchema.statics.findFeaturedProducts = async function () {
  return await this.find({ is_featured: true, status: 'active' }).limit(10);
};

productSchema.statics.findProductsByCategory = async function (categoryId) {
  return await this.find({ category_id: categoryId, status: 'active' }).exec();
};

// Add this to your Product.js schema
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product_id'
});

// Enable virtuals in toJSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('Product', productSchema);
