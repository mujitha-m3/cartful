const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Add category form
router.get('/add', categoryController.renderAddCategoryForm);

// Create category
router.post('/', categoryController.createCategory);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Delete category
router.post('/delete/:id', categoryController.deleteCategory);

// Edit category form
router.get('/edit/:id', categoryController.renderEditCategoryForm);

// Update category
router.post('/edit/:id', categoryController.updateCategory);

module.exports = router;
