const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Utility to calculate the final discounted price
const calculateDiscountPrice = (price, discount) => {
  if (discount.type === 'percentage') {
    return price - (price * discount.value / 100);
  } else if (discount.type === 'fixed') {
    return price - discount.value;
  }
  return price;
};

// Static method on Product model assumed as per your initial instruction
Product.schema.statics.findDiscountedProducts = async function () {
  return await this.find({
    discount_type: { $exists: true, $ne: null },
    discount_value: { $gt: 0 },
    status: 'active'
  })
  .limit(10)
  .populate('category_id')
  .exec();
};

// Fetch discounted products
const getDiscountedProducts = async () => {
  try {
    const products = await Product.findDiscountedProducts();
    return products.map(product => ({
      ...product._doc,
      finalPrice: calculateDiscountPrice(product.price, {
        type: product.discount_type,
        value: product.discount_value
      }),
      hasDiscount: true
    }));
  } catch (err) {
    console.error('Error fetching discounted products:', err);
    return [];
  }
};

// Home page: show discounted, featured, and all categories
router.get('/', async (req, res) => {
  try {
    const [categories, featuredProducts, discountedProducts] = await Promise.all([
      Category.find({
        is_active: true,
        parent_category_id: null
      }).sort({ name: 1 }).limit(10),

      Product.find({ is_featured: true, status: 'active' }).limit(8),

      getDiscountedProducts()
    ]);

    res.render('index', {
      title: 'Home',
      products: featuredProducts,
      discountedProducts,
      categories,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });

  } catch (err) {
    console.error('Error loading home page:', err);
    req.flash('error_msg', 'Error loading home page');

    res.render('index', {
      title: 'Home',
      products: [],
      discountedProducts: [],
      categories: [],
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  }
});

module.exports = router;
