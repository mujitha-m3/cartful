const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { ensureCustomer } = require('../middleware/auth');

// Utility to calculate the final discounted price
const calculateDiscountPrice = (price, discount) => {
  if (discount.type === 'percentage') {
    return price - (price * discount.value / 100);
  } else if (discount.type === 'fixed') {
    return price - discount.value;
  }
  return price;
};

// Static method on Product model assumed as per your initial instruction
Product.schema.statics.findDiscountedProducts = async function () {
  return await this.find({
    discount_type: { $exists: true, $ne: null },
    discount_value: { $gt: 0 },
    status: 'active'
  })
  .limit(10)
  .populate('category_id')
  .exec();
};

// Fetch discounted products
const getDiscountedProducts = async () => {
  try {
    const products = await Product.findDiscountedProducts();
    return products.map(product => ({
      ...product._doc,
      finalPrice: calculateDiscountPrice(product.price, {
        type: product.discount_type,
        value: product.discount_value
      }),
      hasDiscount: true
    }));
  } catch (err) {
    console.error('Error fetching discounted products:', err);
    return [];
  }
};

// Home page: show discounted, featured, and all categories
router.get('/', async (req, res) => {
  try {
    const [categories, featuredProducts, discountedProducts] = await Promise.all([
      Category.find({
        is_active: true,
        parent_category_id: null
      }).sort({ name: 1 }).limit(10),

      Product.find({ is_featured: true, status: 'active' }).limit(8),

      getDiscountedProducts()
    ]);

    res.render('index', {
      title: 'Home',
      products: featuredProducts,
      discountedProducts,
      categories,
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });

  } catch (err) {
    console.error('Error loading home page:', err);
    req.flash('error_msg', 'Error loading home page');

    res.render('index', {
      title: 'Home',
      products: [],
      discountedProducts: [],
      categories: [],
      success_msg: req.flash('success_msg'),
      error_msg: req.flash('error_msg')
    });
  }
});

// Contact Us page
router.get('/contact', ensureCustomer, (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

// Handle contact form submission
router.post('/contact', ensureCustomer, async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const transporter = req.app.locals.transporter;
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: 'CartFul Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    req.flash('success_msg', 'Your message has been sent successfully.');
    return res.redirect('/contact');
  } catch (err) {
    console.error('Contact form email error:', err);
    req.flash('error_msg', 'Failed to send your message. Please try again later.');
    return res.redirect('/contact');
  }
});

// About Us page
router.get('/about', ensureCustomer, (req, res) => {
  res.render('about', { title: 'About Us' });
});

module.exports = router;
