const express = require('express');
const router = express.Router();
const User = require('../models/user'); 

// POST: Customer Registration
router.post('/api/customerRegister', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      gender,
      dateOfBirth,
      language,
      phone,
      profileImage,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country
    } = req.body;

    const newUser = new User({
      fullName,
      email,
      password,
      gender,
      dateOfBirth,
      language,
      phone,
      profileImage,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country
    });

    await newUser.save();

    res.location(`http://localhost:8000/api/customerRegister/${newUser._id}`);
    res.status(201).json(newUser);
    //res.send('Customer Registration is Completed');
  } catch (err) {
    console.error(' Registration Error:', err);
    res.status(500).send(' Registration Failed');
  }
});

module.exports = router;
