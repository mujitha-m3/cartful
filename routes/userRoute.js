const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { registerCustomer, loginCustomer } = require('../controllers/userController');

router.post('/api/customerRegister', registerCustomer);
//router.post('/api/customerlogin', loginCustomer);
module.exports = router;
