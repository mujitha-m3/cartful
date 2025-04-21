const express = require('express');
const router = express.Router();
const Country = require('../models/country');

// POST: Create a new country
router.post('/api/countries', async (req, res) => {
    try {
      const { name, 
        code, 
        continent, 
        isActive } = req.body;
  
      const newCountry = new Country({
        name,
        code,
        continent,
        isActive
      });
  
      await newCountry.save();
      res.location(`http://localhost:8000/api/countries/${newCountry._id}`);
      res.status(201).json(newCountry);
      res.send('Country Record Created Successfully');

return res.status(201).json(newCountry);
    } catch (err) {
      console.error('Error creating country:', err);
      res.status(500).send('Country creation failed');
    }
  });


module.exports = router;