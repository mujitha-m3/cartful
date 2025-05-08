const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  price: { type: Number, required: true },
  original_price: Number,

  
  discount_type: { type: String, enum: ['percentage', 'flat'], default: null },
  discount_value: { type: Number, default: null },
  discount_start: { type: Date, default: null },
  discount_end: { type: Date, default: null },
  discount_reason: { type: String, default: '' },
  discounted_price:{type:Number,default:null},

  stock: Number,
  low_stock_threshold: { type: Number, default: 5 },
  image_url: String,
  thumbnail_url: String,
  alt_text: String,
  is_featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lifecycle: {
    manufacture_date: { type: Date },
    expiry_date: { type: Date }
  },

  season: { type: String }
}, { timestamps: true });

// Static methods
productSchema.statics.findProductById = async function (id) {
  return await this.findById(id).populate('category_id').exec();
};

productSchema.statics.findFeaturedProducts = async function () {
  return await this.find({ is_featured: true, status: 'active' }).limit(10);
};

productSchema.statics.findProductsByCategory = async function (categoryId) {
  return await this.find({ category_id: categoryId, status: 'active' }).exec();
};

// Connect reviews collection
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product_id'
});

// Virtual to detect products nearing expiry
productSchema.virtual('isNearingExpiry').get(function () {
  if (this.lifecycle && this.lifecycle.expiry_date) {
    const today = new Date();
    const sixMonthsFromToday = new Date();
    sixMonthsFromToday.setMonth(today.getMonth() + 6);
    return this.lifecycle.expiry_date <= sixMonthsFromToday;
  }
  return false;
});

// Enable virtuals in outputs
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);