const Product = require('../models/Product');
const Category = require('../models/Category');  // Assuming you have a Category model

// Render the update product form
const renderUpdateProductForm = async (req, res) => {
  try {
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

const updateProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);

    // Redirect to the products list or product details page after the update
    res.redirect('/products'); // Or redirect to the updated product details page
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).send('Failed to update product');
  }
};
