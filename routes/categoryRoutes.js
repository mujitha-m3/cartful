const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Define the routes and associate them with controller functions
router.get('/categories/add', categoryController.renderAddCategoryForm);
router.post('/categories', categoryController.createCategory); // ← Add this route before any /:id route
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);          // Fetch all categories
router.post('/', categoryController.createCategory);          // Create a new category
router.get('/:id', categoryController.getCategoryById);       // Get a category by ID
router.put('/:id', categoryController.updateCategory);        // Update a category by ID
router.delete('/:id', categoryController.deleteCategory);    // Delete a category by ID
router.get('/hierarchy', categoryController.getCategoryHierarchy); // Fetch category hierarchy


module.exports = router;
