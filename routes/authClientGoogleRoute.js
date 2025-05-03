const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User'); 


// Route to start Google login
router.get('/auth/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'] 
    })
  );

// Callback route after Google authentication
router.get('/cartfulAuthClient/response', 
    passport.authenticate('google', { failureRedirect: '/' }),  // Redirect 
    async(req, res) => 
        {
            try {
                const { email, displayName, photos } = req.user; // Extract data from Google profile
        
                // Check if the user already exists in the database
                let user = await User.findOne({ email });
        
                if (!user) {
                  // If the user does not exist, create a new user
                  user = new User({
                    fullName: displayName,
                    email,
                    profileImage: photos[0].value, // Set profile image from Google
                    isActive: true,
                    emailVerified: true 
                  });
        
                  await user.save();
                  console.log('New user created:', user);
                } else {
                  console.log('User already exists:', user);
                }
        
               res.redirect('/profile');
              } catch (err) {
                console.error('Error during Google login:', err);
                res.status(500).send('Server error');
              }
            }
        );
      
module.exports = router;
