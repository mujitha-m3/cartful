const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const User = require('../models/User'); // import user collection

// Create User Function
const registerNewUser = async (req,res) => {
    
    const {
        fullName,email,password,
        gender,dateOfBirth,language,
        phone,profileImage,addressLine1,
        addressLine2,city,postalCode,country
      } = req.body;


    const newUser = new User(
        {
            fullName,email,password,
        gender,dateOfBirth,language,
        phone,profileImage,addressLine1,
        addressLine2,city,postalCode,country
    }); 
    try{
        await newUser.save();
        res.location(`http://localhost:8000/api/customerRegister/${newUser._id}`);
        res.status(201).json(newUser);

    }
    catch (err) {
        console.error(' Error in Customer Registration:', err);
        res.status(500).send(' Registration Failed');
    }
}

module.exports = {registerNewUser};
=======
const User = require('../models/User');

// POST: Register Customer
const registerCustomer = async (req, res) => {
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
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).send('Registration Failed');
    }
};

// Login 
const loginCustomer = async (req, res) => {
    // loging logic here
};

// Export as object
module.exports = {
    registerCustomer
   // loginCustomer
};
>>>>>>> 86cfcc35f6715699f77d14f121ebe4494a059842
