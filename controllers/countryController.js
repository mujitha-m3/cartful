const Country = require('../models/Country');
  

const addCountry = async (req, res) => {
    const { name, code, continent, isActive } = req.body;
  
    const newCountry = new Country({
      name,
      code,
      continent,
      isActive,
    });
  
    try {
      await newCountry.save();
  
      res
        .status(201).location(`http://localhost:8000/api/countries/${newCountry._id}`)
        .json({
          message: 'Country Record Created Successfully',
          data: newCountry,
        });
  
    } catch (err) {
      console.error('Error creating country:', err);
      res.status(500).send('Country creation failed');
    }
  };


const getCountryList = async (req, res) => {
    try {
      const countries = await Country.find();
      res.status(200).json(countries);
    } catch (err) {
      console.error('Error fetching countries:', err);
      res.status(500).send('Failed to get countries');
    }
  };


  module.exports = {addCountry,getCountryList};