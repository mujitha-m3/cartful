module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated() && !req.user.isGuest) {
        return next();
      }
      
      req.session.returnTo = req.originalUrl;
      req.flash('error_msg', 'Please log in to access this page');
      res.redirect('/login');
    },
    
    // You can add other auth-related middleware here too
    forwardAuthenticated: (req, res, next) => {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/account');  
    }
  };