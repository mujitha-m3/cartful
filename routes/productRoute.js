const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const checkAdminUser = require('../middleware/checkAdminUser');

// Browse Products
router.get('/viewproducts', productController.viewProducts);

// Display all products (Admin only)
router.get('/', checkAdminUser, productController.listProducts);

// Add product form (Admin only)
router.get('/add-product', checkAdminUser, productController.renderAddProductForm);

router.get('/view/:id', productController.viewProductDetails);

// Admin view single product
router.get('/:id', checkAdminUser, productController.getProductById);

// Show edit product form
router.get('/edit/:id', checkAdminUser, productController.renderUpdateProductForm);

// Create new product
router.post('/', checkAdminUser, productController.createProduct);

// Update product
router.post('/update/:id', checkAdminUser, productController.updateProduct);

// Delete product
router.post('/delete/:id', checkAdminUser, productController.deleteProduct);

// Submit review - Make sure the parameter name matches what the controller expects
router.post('/:productId/reviews', reviewController.submitReview);

module.exports = router;