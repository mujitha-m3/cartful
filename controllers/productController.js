const Product = require('../models/Product');
const Category = require('../models/Category');

// Helper function to calculate discounted price
const calculateDiscountPrice = (price, discount) => {
  if (!discount || !discount.type || !discount.value) return price;

  if (discount.type === 'percentage') {
    return price * (1 - discount.value / 100);
  } else if (discount.type === 'fixed') {
    return price - discount.value;
  }
  return price;
};

// List all products (with optional search)
const listProducts = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } }
      : {};

    const products = await Product.find(filter);
    const productsWithDiscount = products.map(product => ({
      ...product._doc,
      finalPrice: calculateDiscountPrice(product.price, product.discount)
    }));

    res.render('products', {
      title: 'All Products',
      products: productsWithDiscount,
      searchQuery
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to fetch products');
    res.redirect('/');
  }
};

// Show single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/products');
    }

    const finalPrice = calculateDiscountPrice(product.price, product.discount);

    res.render('products', {
      title: product.name,
      product: {
        ...product._doc,
        finalPrice,
        hasDiscount: product.discount && product.discount.value > 0
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/products');
  }
};

// Show add product form
const renderAddProductForm = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('addProduct', {
      title: 'Add New Product',
      categories,
      discountTypes: ['percentage', 'fixed']
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load form');
    res.redirect('/products');
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, price, category_id, discount_type, discount_value, is_featured } = req.body;

    // Validation for required fields
    if (!name || !price || !category_id) {
      req.flash('error_msg', 'Name, price, and category are required');
      return res.redirect('/products/add-product');
    }

    // Handle the 'is_featured' checkbox: convert to Boolean
    const isFeatured = req.body.is_featured === 'on';  // 'on' means true, otherwise false

    // Prepare the discount object if a discount value is provided
    const discount = discount_value
      ? { type: discount_type, value: parseFloat(discount_value) }
      : {};

    // Create new product object with the data from the form
    const newProduct = new Product({
      ...req.body,
      is_featured: isFeatured,  // Add the correct boolean value for 'is_featured'
      discount,
      created_by: req.user._id  // Assuming you are using `req.user._id` for the creator
    });

    // Save the product to the database
    await newProduct.save();

    req.flash('success_msg', 'Product created successfully');
    res.redirect('/products');  // Redirect to the product listing page
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to create product');
    res.redirect('/products/add-product');
  }
};

// Show edit product form
const renderUpdateProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const categories = await Category.find();

    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/products');
    }

    res.render('update-product', {
      title: 'Edit Product',
      product,
      categories,
      discountTypes: ['percentage', 'fixed']
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load edit form');
    res.redirect('/products');
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { discount_type, discount_value, is_featured } = req.body;

    // Handle the 'is_featured' checkbox: convert to Boolean
    const isFeatured = req.body.is_featured === 'on';

    // Prepare the discount object if a discount value is provided
    const discount = discount_value
      ? { type: discount_type, value: parseFloat(discount_value) }
      : {};

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        is_featured: isFeatured,
        discount
      },
      { new: true }
    );

    if (!updatedProduct) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/products');
    }

    req.flash('success_msg', 'Product updated successfully');
    res.redirect('/products');   // Redirect to the updated product's page
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update product');
    res.redirect(`/products/edit/${req.params.id}`);
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Product deleted successfully');
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete product');
    res.redirect('/products');
  }
};

module.exports = {
  listProducts,
  getProductById,
  renderAddProductForm,
  createProduct,
  renderUpdateProductForm,
  updateProduct,
  deleteProduct
};
