// routes/productRoute.js
const express = require('express');
const router = express.Router();
const { renderAddProductForm, createProduct } = require('../controllers/productController');

// Route to render the add product form
router.get('/products/add', renderAddProductForm);

// Route to handle product form submission
router.post('/products/add', createProduct);

module.exports = router;
