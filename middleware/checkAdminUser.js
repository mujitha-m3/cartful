module.exports = function checkAdminUser(req, res, next) {
    // Check if user is logged in and has 'admin' role
    if (req.user && req.user.roles && req.user.roles.includes('admin')) {
      return next(); // Allow access
    }
  
    // If not admin, show an access denied error
    return res.status(403).render('error', {
      error: {
        message: 'Access denied. Admins only.',
        status: 403
      }
    });
  };
  