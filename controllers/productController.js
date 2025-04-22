// controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');  // Assuming you have a Category model

// Render the update product form
const renderUpdateProductForm = async (req, res) => {
  try {
    // Get the product by its ID
    const product = await Product.findById(req.params.id).populate('category_id');

    // Get all categories to populate the category list
    const categories = await Category.find();

    // Render the form with product and categories data
    res.render('updateProduct', { 
      product: product,
      categories: categories 
    });

  } catch (err) {
    console.error('Error fetching product or categories:', err);
    res.status(500).send('Failed to load product details');
  }
};

// Handle the update of a product
const updateProduct = async (req, res) => {
  try {
    // Find the product by ID and update it with the new data
    await Product.findByIdAndUpdate(req.params.id, req.body);

    // Redirect to the products list or product details page after the update
    res.redirect('/products'); // Or redirect to the updated product details page
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Failed to update product');
  }
};

module.exports = { renderUpdateProductForm, updateProduct };
