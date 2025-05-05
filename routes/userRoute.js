const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


// Registration
router.get('/register', userController.renderRegisterPage);

router.post('/api/customerRegister', (req, res) => {
  console.log('router post /api/customerRegister called');
  userController.registerNewUser(req, res);
});

// Email Verification
router.get('/verifyEmail', userController.renderVerificationPage);

router.post('/api/verifyEmail', (req, res) => {
  console.log('router post /api/verifyEmail called');
  userController.verifyEmailVerificationCode(req, res);
});

router.post('/api/resendCode', (req, res) => {
  console.log('router post /api/resendCode called');
  userController.resendVerificationCode(req, res);
});

// Password creation after verification
router.post('/api/createPassword', (req, res) => {
  console.log('router post /api/createPassword called');
  userController.createPassword(req, res);
});
router.get('/login', (req, res) => {
  res.render('login');
});

// Login / Logout
router.post('/api/loginUser', userController.loginUser);

router.post('/api/logout', (req, res) => {
  console.log('router post /api/logout called');
  userController.logout(req, res);
});

router.post('/logout', (req, res) => {
  console.log('router post /logout called');
  userController.logout(req, res);
});

router.get('/forgotPassword', userController.renderForgotPasswordForm);
//router.post('/api/forgotPasswordSendCode',userController.forgotPasswordSendCode);
router.post('/api/forgotPasswordSendCode',(req,res)=>{
  console.log('router forgot Password /api/forgotPasswordSendCode method called');
  userController.forgotPasswordSendCode(req,res);
});
// Profile Management
router.patch('/api/users/:id', (req, res) => {
  console.log('router patch /api/users/:id called');
  userController.updateProfile(req, res);
});

// Find User by Email
router.get('/api/users/email/:email', (req, res) => {
  console.log('router get /api/users/email/:email called');
  userController.findUserByEmail(req, res);
});

// Find All Users with Same Email
router.get('/api/allUsers/email/:email', (req, res) => {
  console.log('router get /api/allUsers/email/:email called');
  userController.findAllUsersByEmail(req, res);
});

// Get All Users
router.get('/api/users', (req, res) => {
  console.log('router get /api/users called');
  userController.getAllUsers(req, res);
});

// Get User by ID
router.get('/api/users/:id', (req, res) => {
  console.log('router get /api/users/:id called');
  userController.getUserById(req, res);
});

// Delete Single User
router.delete('/api/deleteUser', (req, res) => {
  console.log('router delete /api/deleteUser called');
  userController.deleteUser(req, res);
});

// Delete All Users by Email
router.delete('/api/deleteAllUserbyEmail', (req, res) => {
  console.log('router delete /api/deleteAllUserbyEmail called');
  userController.deleteAllUserbyEmail(req, res);
});

// Google Auth Profile
router.get('/profile', (req, res) => {
  console.log('router get /profile called');
  console.log('User data:', req.user);
  if (!req.user) {
    return res.redirect('/auth/google');
  }
  res.render('profile', { user: req.user });
});

module.exports = router;


