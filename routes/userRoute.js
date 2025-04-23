const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/register', userController.renderRegisterPage);

// POST: Customer Registration
router.post('/api/customerRegister', userController.registerNewUser);

module.exports = router;


