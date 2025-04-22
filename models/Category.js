const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  description: String,
  icon_url: String,
  parent_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  restricted_countries: [String],
  localized_names: mongoose.Schema.Types.Mixed,
  is_active: { type: Boolean, default: true }
});

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// ✅ Define a virtual for children
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent_category_id'
});

// ✅ Ensure virtuals are included in output
categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
