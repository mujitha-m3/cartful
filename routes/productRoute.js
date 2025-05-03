const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');

// Browse Products
router.get('/viewproducts', productController.viewProducts); 

// Display all products
router.get('/', productController.listProducts);

// Show add product form
router.get('/add-product', productController.renderAddProductForm);

router.get('/view/:id', productController.viewProductDetails);

// Show single product
router.get('/:id', productController.getProductById);

// Show edit product form
router.get('/edit/:id', productController.renderUpdateProductForm);

// Create new product
router.post('/', productController.createProduct);

// Update product
router.post('/update/:id', productController.updateProduct);

// Delete product
router.post('/delete/:id', productController.deleteProduct);

// Submit review - Make sure the parameter name matches what the controller expects
router.post('/:productId/reviews', reviewController.submitReview);

module.exports = router;