const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST: Customer Registration
router.post('/api/customerRegister',userController.registerNewUser) ;
  

module.exports = router;
