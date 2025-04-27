const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/register', userController.renderRegisterPage);

//  Customer Registration
/*router.post('/api/customerRegister', userController.registerNewUser);
router.get('/verifyEmail', userController.renderVerificationPage);
router.post('/resendCode', userController.resendVerificationCode);
router.post('/verifyEmail', userController.verifyEmailVerificationCode); 
router.get('/logout', userController.logout);
 // To view the profile
router.patch('/api/users/:id', userController.updateProfile); // To update the profile
router.post('/deleteUser', userController.deleteUser);*/

router.post('/api/customerRegister', userController.registerNewUser);
router.get('/api/verifyEmail', userController.renderVerificationPage);  
router.post('/api/resendCode', userController.resendVerificationCode);  
router.post('/api/verifyEmail', userController.verifyEmailVerificationCode);  
router.post('/api/login', userController.loginUser);
router.patch('/api/users/:id', userController.updateProfile);
router.get('/api/users/email/:email', userController.findUserByEmail);
router.get('/api/users', userController.getAllUsers);
router.get('/api/users/:id', userController.getUserById);
router.post('/api/deleteUser', userController.deleteUser);
router.post('/api/logout', userController.logout);
router.post('/logout', userController.logout);



// Google Auth
//router.get('/profile', userController.getProfile);
router.get('/profile', (req, res) => {
    console.log('User data:', req.user); // Check if req.user is populated
    if (!req.user) {
      return res.redirect('/auth/google'); // If user is not logged in, redirect to Google auth
    }
    res.render('profile', { user: req.user }); // Pass user data to view
  });

module.exports = router;


