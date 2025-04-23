const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');



// POST: Create a new country
router.post('/api/countries',countryController.addCountry);

// Retirive Country list
router.get('/api/getCountryList',countryController.getCountryList);

module.exports = router;