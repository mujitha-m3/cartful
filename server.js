const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Handlebars setup with prototype access
app.engine('handlebars', exphbs.engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  helpers: {
    formatDate: (date) => new Date(date).toLocaleDateString(),
    ifEquals: (arg1, arg2, options) => (arg1 == arg2 ? options.fn(this) : options.inverse(this)),
    formatPrice: (price) => (price ? `$${price.toFixed(2)}` : '$0.00'),
    hasChildren: (category) => category.children && category.children.length > 0
  }
}));
app.set('view engine', 'handlebars');

// MongoDB connection
const dbURI = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;

mongoose.connect(dbURI)
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    console.log('Connected to DB');
  })
  .catch(err => console.log(err));

// TEMPORARY: Simulate a logged-in user (replace with a real ID from your DB)
app.use((req, res, next) => {
  req.user = { _id: '6804ab38d40c821fa6b71237' };
  next();
});

// ======================
// Home Route
// ======================
app.get('/', (req, res) => {
  res.render('index', { title: 'Product Management System' });
});

// ======================
// Product Routes
// ======================
app.get('/products', async (req, res) => {
  const searchQuery = req.query.search;
  try {
    let products;
    if (searchQuery) {
      products = await Product.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { category_id: { $regex: searchQuery, $options: 'i' } }
        ]
      });
    } else {
      products = await Product.find().sort({ createdAt: -1 });
    }

    res.render('products', {
      title: '',
      products: products.map(product => product.toJSON()),
      searchQuery: searchQuery || ''
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error retrieving products' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category_id');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

app.get('/add-product', async (req, res) => {
  const categories = await Category.find();
  res.render('addProduct', { title: 'Add a New Product', categories });
});

app.post('/products', async (req, res) => {
  const { name, slug, description, price, original_price, discount, stock, image_url, thumbnail_url, alt_text, category_id, allowed_countries, is_featured, status } = req.body;

  if (!name || !price) {
    return res.status(400).send('Product name and price are required.');
  }

  const discountObj = discount ? JSON.parse(discount) : {};

  try {
    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      original_price,
      discount: discountObj,
      stock,
      image_url,
      thumbnail_url,
      alt_text,
      category_id,
      allowed_countries,
      is_featured: is_featured === 'on',
      status: status || 'active',
      created_by: req.user ? req.user.id : null
    });

    await newProduct.save();

    if (req.headers['content-type'] === 'application/json') {
      res.status(201).json(newProduct);
    } else {
      res.redirect('/products');
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error adding product' });
  }
});

// ======================
// Category Routes
// ======================
app.use('/api/categories', categoryRoutes);

app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ parent_category_id: null })
      .populate({
        path: 'children',
        options: { sort: { name: 1 } }
      })
      .sort({ name: 1 });

    res.render('categories', {
      title: 'Category Management',
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error loading categories' });
  }
});

app.get('/categories/add', async (req, res) => {
  try {
    const parentCategories = await Category.find({ is_active: true }).sort({ name: 1 });
    res.render('addCategory', {
      title: 'Add New Category',
      parentCategories
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { error: 'Error loading form' });
  }
});

app.post('/categories', async (req, res) => {
  try {
    const { name, description, parent_category_id } = req.body;

    if (parent_category_id) {
      const parentExists = await Category.exists({ _id: parent_category_id });
      if (!parentExists) {
        return res.status(400).render('error', { error: 'Selected parent category does not exist' });
      }
    }

    const newCategory = new Category({
      name,
      description,
      parent_category_id: parent_category_id || null
    });

    await newCategory.save();
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).render('error', { error: 'Category name already exists' });
    } else {
      res.status(500).render('error', { error: 'Error creating category' });
    }
  }
});

const cartRoutes = require('./routes/cartRoutes');
app.use('/cart', cartRoutes);

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Something went wrong!' });
});
