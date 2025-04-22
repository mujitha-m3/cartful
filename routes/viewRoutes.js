const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Home page: show all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('index', { products });
  } catch (err) {
    console.error('Error loading products:', err);
    res.render('index', { products: [] });
  }
});

module.exports = router;
