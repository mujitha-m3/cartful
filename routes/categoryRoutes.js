const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Add category form
router.get('/add', categoryController.renderAddCategoryForm);

// Create category
router.post('/', categoryController.createCategory);

// Get all categories (renders HTML or returns JSON based on request)
router.get('/', categoryController.getAllCategories);

// Get category hierarchy
router.get('/hierarchy', categoryController.getCategoryHierarchy);

// Get single category by ID (API use)
router.get('/:id', categoryController.getCategoryById);

// Update category by ID
router.put('/:id', categoryController.updateCategory);

// Delete category by ID
router.post('/delete/:id', categoryController.deleteCategory); // POST for form submission

module.exports = router;
