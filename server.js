// Load environment variables from .env
require('dotenv').config();

// Import the dependencies
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

// Import routes
const userRoute = require('./routes/userRoute');
const countryRoutes = require('./routes/countryRoute');
const productRoutes = require('./routes/productRoute');
const viewRoutes = require('./routes/viewRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Initialize Express 
const app = express();

// Serve static files from "public" folder
app.use(express.static('public'));

// Middleware setup for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session and flash message setup
app.use(session({
  secret: 'cartful-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

// Make flash messages available to views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});


// Config for Handlebars
app.engine('handlebars', exphbs.engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  helpers: {
    formatDate: (date) => new Date(date).toLocaleDateString(),
    ifEquals: (arg1, arg2, options) => (arg1 == arg2 ? options.fn(this) : options.inverse(this)),
    formatPrice: (price) => (price ? `$${price.toFixed(2)}` : '$0.00'),
    hasChildren: (category) => category.children && category.children.length > 0,
    calculateTotal: (items) => {
      let total = 0;
      for (let item of items) {
        total += item.total_price;
      }
      return total.toFixed(2);
    }
  }
}));
app.set('view engine', 'handlebars');

// Simulated logged-in user middleware (for testing purposes)
app.use((req, res, next) => {
  req.user = { _id: '6804ab38d40c821fa6b71237' };
  next();
});

// Routes setup
app.use('/', viewRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/cart', cartRoutes);
app.use('/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/', userRoute);
app.use('/', countryRoutes);


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: 'Something went wrong!' });
});

// MongoDB connection and server start
const dbURI = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;

mongoose.connect(dbURI)
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Connected to MongoDB');
    });
  })
  .catch(err => console.log('DB Connection Error:', err));






