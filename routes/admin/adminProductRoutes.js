const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');
const checkAdminUser = require('../../middleware/checkAdminUser');

// Protect all admin product routes
router.use(checkAdminUser);

// GET: list all products for admin
router.get('/', productController.listProducts);
// GET: show add product form
router.get('/add', productController.renderAddProductForm);
// POST: create new product
router.post('/add', productController.createProduct);
// GET: show edit form
router.get('/edit/:id', productController.renderUpdateProductForm);
// POST: update product
router.post('/update/:id', productController.updateProduct);
// POST: delete product
router.post('/delete/:id', productController.deleteProduct);

module.exports = router;