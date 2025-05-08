const express = require('express');
const router = express.Router();
const checkAdminUser = require('../middleware/checkAdminUser');
const productDiscountController = require('../controllers/productDiscountController');


router.get('/admin/discounts/search',  productDiscountController.showDiscountPage);
router.post('/products/:id/discount', productDiscountController.applyDiscountToProduct);
router.post('/products/discounts', productDiscountController.saveMultipleDiscounts);




module.exports = router;