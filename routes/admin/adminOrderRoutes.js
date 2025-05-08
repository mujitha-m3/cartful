const express = require('express');
const router = express.Router();
const checkAdmin = require('../../middleware/checkAdminUser');
const { listOrders, editOrderForm, updateOrderStatus } = require('../../controllers/orderController');

// Admin must be logged in and have “admin” role
router.use(checkAdmin);

// GET /admin/orders       → listOrders
// GET /admin/orders/:id   → editOrderForm
// POST /admin/orders/:id  → updateOrderStatus
router.get('/', listOrders);
router.get('/:id', editOrderForm);
router.post('/:id', updateOrderStatus);

module.exports = router;