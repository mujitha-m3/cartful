  const User = require('../models/user');
  const Country = require('../models/Country');
  const crypto = require('crypto');
  require('dotenv').config();
  const sendVerificationEmail = require('./emailController');

  const getVerificationCode = (email)=>{
    let randomGenCode= crypto.randomInt(1000, 9999).toString();
    const emailText =email.trim().substring(0,3);
    return randomGenCode +emailText;
  }


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

        let newUser = new User({
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
          country,
          isActive: false,
          emailVerified:false
          
        });
        try{
            newUser = await newUser.save();  // save user 
        console.log("User saved!");
        res.location(`http://localhost:8000/api/customerRegister/${newUser._id}`);
            
          const newUserId = newUser.id;
          const uswerTempName = newUser.fullName;
          const verificationCode = getVerificationCode(newUser.email)
          await User.findByIdAndUpdate(newUserId, {
          
            verificationGeneratedBySystem: verificationCode
            
          });
          
          sendVerificationEmail(newUser.email, newUser.fullName, verificationCode);
          console.log(`Verification code sent to ${newUser.email}: ${verificationCode}`);
          res.status(201).json({msg:"Member Added, Please check your email for verificaiton Code and very your email",user: newUser});
          console.log(`Verification code sent to ${newUser.email}: ${verificationCode}`);

    
        }catch (err) {
          console.error('Error in Customer Registration:', err); // log error
          res.status(500).send('Registration Failed'); // send error to frontend
        }
        
  };

  const renderRegisterPage = async (req, res) => {
    try {
      const countries = await Country.find({ isActive: true }).sort({ name: 1 });
      res.render('userRegister', { countries });
    } catch (error) {
      console.error('Error loading registration page:', error);
      res.status(500).send('Failed to load registration form');
    }
  };

  const resendVerificationCode = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }
    const verificationCode = getVerificationCode(email);
    user.verificationGeneratedBySystem = verificationCode;
    await user.save();

    sendVerificationEmail(user.email, user.fullName, verificationCode);
    res.send('Verification code resent to your email!');
  };

  exports.renderRegisterPage = async (req, res) => {
    try {
      const countries = await Country.find({ isActive: true }).sort({ name: 1 });
      res.render('userRegister', { countries });
    } catch (error) {
      console.error('Error loading registration page:', error);
      res.status(500).send('Failed to load registration form');
    }
  };

  const renderVerificationPage = (req, res) => {
    res.render('emailVerification'); // file: views/emailVerification.handlebars
  };

  const verifyEmailVerificationCode = async (req, res) => {
    const { email, code } = req.body;

    console.log(" [VERIFY EMAIL] Request received");
    console.log("Email from user:", email);
    console.log("Code gien by user:", code);

    //get user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    // 2. Compare submitted code with system's code
    if (user.verificationGeneratedBySystem === code) {
      // Match: update status
      user.emailVerified = true;
      user.isActive = true;
      user.verificationGeneratedBySystem = null; 
      await user.save();
      return res.send(' Email verified successfully!');
    } else {
      console.log("Code mismatch!");
      console.log("Requried Code:", user.verificationGeneratedBySystem);
      console.log("Entered code:", code);
    
      return res.status(400).send(
        `Verification code is invalid , Pre Enter Correct code or Requst a New Code.`
      );
    /**return res.status(400).send(
        `Verification code is incorrect. Expected: ${user.verificationGeneratedBySystem}, Received: ${code}`
      ); */ 
    }
  };

  const getProfile = (req, res) => {
    if (!req.user) {
      return res.redirect('/auth/google'); // or wherever you want to send users who are not logged in
    }
    console.log("User Data:", req.user); // Log the user data to check if it's correct
    res.render('profile', { user: req.user }); // This ensures the data is passed to the view
  };


  const logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');  // Redirect to homepage or login page after logout
    });
  };

  const updateProfile = async (req, res) => {
  const { fullName, email, phone, profileImage } = req.body;
  
  try {
    // Find user by ID
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the fields that have been provided
    if (fullName) user.fullName = fullName;
     if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    // Save the updated user
    await user.save();

    // Return the updated user data as a response
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const createSSOUser = async (profile) => {
  try {
    // Create a new user object from profile data
    const newUser = new User({
      fullName: profile.displayName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0].value,
      isActive: true,
      emailVerified: true
    });

    // Save the user to the database
    await newUser.save();
    console.log('New SSO user created:', newUser);
    return newUser; // Return the newly created user
  } catch (err) {
    console.error('Error creating new SSO user:', err);
    throw new Error('Error creating new SSO user');
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    return user;
  } catch (err) {
    console.error('Error finding user by email:', err);
    throw new Error('Error finding user');
  }
};

const findUserById = async (id) => {
  try {
    const user = await User.findById(id); // This queries the database
    if (!user) {
      throw new Error('User not found'); // If no user is found, throw an error
    }
    return user; // If found, return the user document
  } catch (err) {
    throw new Error('Error finding user by ID');
  }
};


const deleteUser = async (req, res) => {
  const { id, email, fullName } = req.body;

  let searchCriteria = null;

  if (id) {
    searchCriteria = { _id: id };
  } else if (email) {
    searchCriteria = { email: email };
  } else if (fullName) {
    searchCriteria = { fullName: fullName };
  } else {
    res.status(400).send(' provide id, email, or fullName to delete.');
    return;
  }

  const user = await User.findOne(searchCriteria);
  if (!user) {
    res.status(404).send('User not found.');
    return;
  }

  await User.deleteOne(searchCriteria);
  res.send( 'User deleted successfully!');
};



  module.exports = {
    registerNewUser,
    renderRegisterPage,
    verifyEmailVerificationCode,
    resendVerificationCode,
    renderVerificationPage,
    createSSOUser,
    getProfile,
    logout,
    updateProfile,
    findUserByEmail,
    findUserById,
     
  };
      
      