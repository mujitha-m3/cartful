const User = require('../models/user');

const registerNewUser = async (req, res) => {
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
      try{
        await newUser.save();  // save 
      console.log("User saved!");
      res.location(`http://localhost:8000/api/customerRegister/${newUser._id}`);
      res.status(201).json(newUser);
      }catch (err) {
        console.error('Error in Customer Registration:', err); // log error
        res.status(500).send('Registration Failed'); // send error to frontend
      }
      
};

module.exports = {registerNewUser};

    
    