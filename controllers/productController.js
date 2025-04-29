const Product = require('../models/Product');
const Category = require('../models/Category');

// Calculate final discounted price
const calculateDiscountPrice = (price, discount) => {
  if (!discount || !discount.type || !discount.value) return price;

  switch (discount.type) {
    case 'percentage':
      return price * (1 - discount.value / 100);
    case 'fixed':
      return price - discount.value;
    default:
      return price;
  }
};

// GET: All Products
const listProducts = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const filter = searchQuery
      ? { name: { $regex: searchQuery, $options: 'i' } }
      : {};

    const products = await Product.find(filter);
    const productsWithFinalPrice = products.map(product => ({
      ...product._doc,
      finalPrice: calculateDiscountPrice(product.price, product.discount)
    }));

    res.render('products', {
      title: 'All Products',
      products: productsWithFinalPrice,
      searchQuery
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to fetch products');
    res.redirect('/');
  }
};

// GET: Single Product
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
        hasDiscount: product.discount?.value > 0
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server error');
    res.redirect('/products');
  }
};

// GET: Render Add Product Form
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

// POST: Create New Product
const createProduct = async (req, res) => {
  try {
    const {
      discount_value,
      discount_type,
      allowed_countries,
      is_featured,
      ...rest
    } = req.body;

    const discount =
      discount_type && discount_value
        ? {
            type: discount_type,
            value: parseFloat(discount_value)
          }
        : undefined;

    const newProduct = new Product({
      ...rest,
      discount,
      is_featured: is_featured === 'on',
      allowed_countries: allowed_countries
        ? allowed_countries.split(',').map(code => code.trim())
        : [],
      created_by: req.user?._id
    });

    await newProduct.save();
    req.flash('success_msg', 'Product created successfully');
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to create product');
    res.redirect('/products/add-product');
  }
};

// GET: Render Update Product Form
const renderUpdateProductForm = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const categories = await Category.find();

    if (!product) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/products');
    }

    const discount = {
      type: product.discount?.type || '',
      value: product.discount?.value || ''
    };

    res.render('update-product', {
      title: 'Edit Product',
      product: {
        ...product._doc,
        discount
      },
      categories,
      discountTypes: ['percentage', 'fixed']
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load edit form');
    res.redirect('/products');
  }
};

// POST: Update Product
const updateProduct = async (req, res) => {
  try {
    const {
      discount_value,
      discount_type,
      allowed_countries,
      is_featured,
      ...rest
    } = req.body;

    const discount =
      discount_type && discount_value
        ? {
            type: discount_type,
            value: parseFloat(discount_value)
          }
        : undefined;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...rest,
        discount,
        is_featured: is_featured === 'on',
        allowed_countries: allowed_countries
          ? allowed_countries.split(',').map(code => code.trim())
          : []
      },
      { new: true }
    );

    if (!updatedProduct) {
      req.flash('error_msg', 'Product not found');
      return res.redirect('/products');
    }

    req.flash('success_msg', 'Product updated successfully');
    res.redirect('/products');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update product');
    res.redirect(`/products/edit/${req.params.id}`);
  }
};

// DELETE: Product
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

// Exports
module.exports = {
  listProducts,
  getProductById,
  renderAddProductForm,
  createProduct,
  renderUpdateProductForm,
  updateProduct,
  deleteProduct
};
