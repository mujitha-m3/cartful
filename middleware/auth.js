// Middleware to ensure user is signed in before accessing checkout
function ensureAuthenticated(req, res, next) {
  console.log('Middleware executed for route:', req.originalUrl);
  console.log('User authenticated:', req.isAuthenticated());
  console.log('User data:', req.user);
  console.log('Session data:', req.session);

  // Check if user is not authenticated or is a guest
  if (!req.isAuthenticated() || (req.user && req.user.isGuest)) {
    // Store the full URL the user was trying to access
    const fullUrl = req.originalUrl;
    req.session.redirectAfterLogin = fullUrl;
    
    // Backup cart data before redirecting
    if (req.session.cart) {
      req.session.cartBackup = req.session.cart;
    }

    req.flash('error_msg', 'Please log in to proceed with checkout.');
    return res.redirect('/login');
  }

  // User is authenticated and not a guest
  return next();
}

// Middleware to ensure route is accessible only by customers
function ensureCustomer(req, res, next) {
  if (!req.isAuthenticated() || !req.user.roles || !req.user.roles.includes('user')) {
    req.flash('error_msg', 'Please log in as a customer to view this page.');
    return res.redirect('/login');
  }
  return next();
}

module.exports = { ensureAuthenticated, ensureCustomer };
