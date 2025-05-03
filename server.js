// Load environment variables from .env
require('dotenv').config();

// Import the dependencies
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const fs = require('fs');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const nodemailer = require('nodemailer');  // Nodemailer for email functionality
const passport = require('passport'); 
require('./passport'); // Passport configuration
const { createServer } = require('http');
const { Server } = require('socket.io');


// Import routes
const googleAuthRoutes = require('./routes/authClientGoogleRoute');  
const userRoute = require('./routes/userRoute');
const countryRoutes = require('./routes/countryRoute');
const productRoutes = require('./routes/productRoute');
const viewRoutes = require('./routes/viewRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userController = require('./controllers/userController');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Initialize Express
const app = express();

// Create temp directory for PDFs if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Serve static files from "public" folder
app.use(express.static('public'));

// Middleware setup for parsing JSON and URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session and flash message setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'cartful-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(flash());

// Make variables available to views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.currentUser = req.user || null;
  res.locals.session = req.session;
  next();
});

// Config for Handlebars
app.engine('handlebars', exphbs.engine({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  helpers: {
    // Existing helpers...
    formatDate: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    ifEquals: (arg1, arg2, options) => (arg1 == arg2 ? options.fn(this) : options.inverse(this)),
    formatPrice: (price) => (price ? `€${price.toFixed(2)}` : '€0.00'),
    hasChildren: (category) => category && category.children && category.children.length > 0,
    calculateTotal: (items) => {
      if (!items) return '0.00';
      let total = 0;
      for (let item of items) {
        total += item.total_price || 0;
      }
      return total.toFixed(2);
    },
    eq: (a, b) => a === b,
    json: (context) => JSON.stringify(context),
    gt: (a, b) => a > b,  // Greater than
    lt: (a, b) => a < b,   // Less than
    
    // New helpers for review system
    formatReviewDate: function(date) {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    },
    times: function(n, block) {
      let accum = '';
      for(let i = 0; i < n; ++i) {
        accum += block.fn(i);
      }
      return accum;
    },
    sub: function(a, b) {
      return a - b;
    },
    round: function(num) {
      return Math.round(num);
    },
    firstLetter: function(str) {
      return str ? str.charAt(0).toUpperCase() : '';
    }
  }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.locals.transporter = transporter;

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Middleware to handle user authentication state
app.use((req, res, next) => {
  // If user is already authenticated (via Passport), continue
  if (req.user) return next();
  
  // For checkout process without authentication
  if (req.session.checkoutDetails?.email) {
    req.user = {
      isGuest: true,
      email: req.session.checkoutDetails.email,
      ...(req.session.checkoutDetails.first_name && { 
        first_name: req.session.checkoutDetails.first_name 
      }),
      ...(req.session.checkoutDetails.last_name && { 
        last_name: req.session.checkoutDetails.last_name 
      })
    };
    return next();
  }

  // No user and no checkout session - treat as guest
  req.user = { isGuest: true };
  next();
});

// Routes setup
app.use('/', googleAuthRoutes);  // Google Auth Routes
app.use('/', userRoute);         // User Routes
app.use('/', countryRoutes);     // Country Routes
app.use('/products', productRoutes);  // Product Routes
app.use('/categories', categoryRoutes); // Category Routes
app.use('/', viewRoutes);        // View Routes
app.use('/checkout', checkoutRoutes); // Checkout Routes
app.use('/cart', cartRoutes);    // Cart Routes
app.use('/wishlist', wishlistRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);

  // Clean up any temporary files
  if (err.tempFile) {
    try {
      fs.unlinkSync(err.tempFile);
    } catch (unlinkErr) {
      console.error('Error cleaning up temp file:', unlinkErr);
    }
  }

  res.status(500).render('error', { 
    error: {
      message: 'Something went wrong!',
      status: 500,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    } 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    error: {
      message: 'Page not found',
      status: 404
    }
  });
});

// MongoDB connection and server start
const dbURI = `mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@${process.env.CLUSTER}.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;

mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  const PORT = process.env.PORT || 8000;
  const httpServer = createServer(app);
  
  // Set up Socket.IO
  const io = new Server(httpServer, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  app.locals.io = io; // Make io accessible in routes

  const server = httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Connected to MongoDB');
  });

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
})
.catch(err => {
  console.error('DB Connection Error:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server and exit process
  process.exit(1);
});