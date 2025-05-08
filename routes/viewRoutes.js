const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// Home page: show all products and categories
router.get('/', async (req, res) => {
  try {
    // Fetch both products and categories in parallel
    const [products, categories] = await Promise.all([
      Product.find({}),
      Category.find({ 
        is_active: true,
        parent_category_id: null 
      }).sort({ name: 1 }).limit(10)
    ]);

    res.render('index', {
      products,
      categories,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  } catch (err) {
    console.error('Error loading home page:', err);
    req.flash('error_msg', 'Error loading home page');
    // Render with empty arrays if there's an error
    res.render('index', { 
      products: [], 
      categories: [],
      error_msg: req.flash('error_msg')
    });
  }
});

module.exports = router;