  const User = require('../models/user');
  const Country = require('../models/Country');
  const crypto = require('crypto');
  require('dotenv').config();
  const sendVerificationEmail = require('./emailController');
  const passport = require('passport');
  const mongoose = require('mongoose');

  const getVerificationCode = (email) => {
    const randomCode = crypto.randomInt(1000, 9999).toString();
    const emailPrefix = email.trim().substring(0, 3);
    const verificationCode = randomCode + emailPrefix;
    console.log(" from method getVerificationCode Generated code:", verificationCode); //log
    return verificationCode;
};

const registerNewUser = async (req, res) => {
  console.log("Incomeing msg req data ", req.body);
  let {
    fullName,
    email,
    /* password,
    gender,
    dateOfBirth,
    language,
    phone,
    profileImage,
    addressLine1,
    addressLine2,
    city,
    postalCode,
    country */
  } = req.body;

  try {
    let newUser = new User({
      fullName,
      email,
      /* password,
      gender,
      dateOfBirth,
      language,
      phone,
      profileImage,
      addressLine1,
      addressLine2,
      city,
      postalCode,
      country, */
      isActive: false,
      emailVerified: false
    });

    newUser = await newUser.save();
    console.log("registerNewUser User saved:", newUser);
    const verificationCode = getVerificationCode(email);
    await User.findByIdAndUpdate(newUser._id, {
      verificationGeneratedBySystem: verificationCode
    });
    console.log("registerNewUser OTP saved to user:", verificationCode);
    sendVerificationEmail(email, fullName, verificationCode, newUser._id);
    console.log("registerNewUser veified", email);
    res.status(201).location('/api/users/${newUser._id}')
      .json({
        msg: "Registration successful. Please verify your email.",
        userId: newUser._id
      });
  } catch (error) {
    console.error("registerNewUser Registration error:", error);
    res.status(500).json({ message: "Registration failed." });
  }
};

  /*const verifyEmailVerificationCode = async (req, res) => {
    const { email, veficode } = req.body; 
    console.log("verification request:", { email, veficode }); 
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found:", email);
        return res.status(404).json({ message: "User not registered. Please register first." });
      }  
      if (user.verificationGeneratedBySystem === veficode) { 
        user.emailVerified = true;
        user.isActive = true;
        user.verificationGeneratedBySystem = null;
        await user.save();
        
        console.log("verifyEmailVerificationCode User email verified successfully:", user.email);
        return res.status(200).json({ message: "Email verified successfully! You can now log in." });
      } else {
        console.log("verifyEmailVerificationCode Verification code mismatch!");
        return res.status(400).json({ message: "Verification code is incorrect. Please try again or request a new code." });
      }
  
    } catch (error) {
      console.error("Error during email verification:", error);
      res.status(500).json({ message: "Server error during verification." });
    }
  }; */

  // verifyEmailVerificationCode: redirects to createPassword view on success
const verifyEmailVerificationCode = async (req, res) => {
  const { email, verificationCode } = req.body;
  console.log("verifyEmailVerificationCode Incoming:", { email, verificationCode });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", { email });
      return res.status(404).render('verifyEmail', { errorMessage: "User not registered or wrong email." });
    }

    const systemVerificationCode = user.verificationGeneratedBySystem;
    if (systemVerificationCode === verificationCode) {
      console.log("Verification code match for:", email);
      user.emailVerified = true;
      user.isActive = true;
      user.verificationGeneratedBySystem = null;
      await user.save();

      return res.render('createPassword', { email });
    } else {
      console.log("Verification code mismatch.");
      return res.status(400).render('createPassword', { errorMessage: "Invalid verification code. Please try again." });
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).render('createPassword', { errorMessage: "Server error during verification." });
  }
};
  
const renderRegisterPage = async (req, res) => {
  try {
 /*   const countries = await Country.find({ isActive: true }).sort({ name: 1 });
   console.log("countries check:", countries); 
   res.render('userRegister', { countries });// looding Coutries*/  // commented since not required anymore for iniintal user creation
    res.render('userRegister');
  } catch (error) {
    console.error('Error loading registration page:', error);
    res.status(500).send('Failed to load registration form.');
  }
};  // commented after having discused with team not requried for intial resitation


  const renderVerificationPage = (req, res) => {
   // const reqUserID =  req.query.userId;
  //console.log("Rendering email verification form for userId:",reqUserID );
  res.render('verifyEmail');
  };
  
const resendVerificationCode = async (req, res) => {
  const { email, fullName } = req.body;
  console.log("resendVerificationCode Request to resend code to:", { email }); 

  try {
      const user = await User.findOne({ email: email});
      if (!user) {
          console.log("resendVerificationCode User not found for email ", email, fullName);
          return res.status(404).json({ message: "User not registered or full name/email mismatch." });
      }
      const verificationCode = getVerificationCode(email);
      user.verificationGeneratedBySystem = verificationCode;
      console.log("resendVerificationCode given by the system ", verificationGeneratedBySystem);
      await user.save();
      sendVerificationEmail(email, user.fullName, verificationCode,newUser._id);
      console.log("resendVerificationCode New verification code sent to:", email); 
      res.status(200).json({ message: "Verification code resent successfully." });
  } 
  catch (error) 
  {
      console.error("resendVerificationCode Error:", error);
      res.status(500).json({ message: "Error resending verification code." });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  const { fullName, email, phone, profileImage } = req.body;
  console.log("updateProfile Incoming update for user:", req.params.id);

  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      if (fullName) user.fullName = fullName;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (profileImage) user.profileImage = profileImage;

      await user.save();
      console.log("updateProfile User updated:", user._id);
      res.status(200).json({ message: 'Profile updated successfully.', user });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { id, email, fullName } = req.body;
  console.log("deleteUser Deleting user based on:", { id, email, fullName });

  let searchCriteria = null;
  if (id) searchCriteria = { _id: id };
  else if (email) searchCriteria = { email };
  else if (fullName) searchCriteria = { fullName };
  else {
      return res.status(400).json({ message: 'Provide id, email, or fullName to delete.' });
  }

  try {
      const user = await User.findOne(searchCriteria);
      if (!user) {
          return res.status(404).json({ message: 'User not found.' });
      }

      await User.deleteOne(searchCriteria);
      console.log("deleteUser User deleted.");
      res.status(200).json({ message: 'User deleted successfully!' });

  } catch (error) {
      console.error("deleteUser Error:", error);
      res.status(500).json({ message: 'Failed to delete user.' });
  }
};

const deleteAllUserbyEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Provide email to delete.' });
  }

  try {
    const result = await User.deleteMany({ email });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No users found to delete.' });
    }

    res.status(200).json({ message: `${result.deletedCount} user(s) deleted successfully.` });
  } catch (error) {
    console.error("deleteAllUserbyEmail Error:", error);
    res.status(500).json({ message: 'canot to delete users.' });
  }
};

//loginUser method
const userLogin = async (req, res) =>{
  res.render('login');
};

const loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(' Error:', err);
      return res.status(500).json({ message: 'Server error during login.' });
    }

    if (!user) {
      console.log('Login API Login failed:', info.message);
      return res.status(401).json({ message: info.message || 'Login failed.' });
    }

  
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login API Login error:', err);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
      }

      console.log('Login API Login successful for:', user.email);
      //return res.status(200).json({ message: 'Login successful!', userId: user._id });
      req.flash('success_msg', 'Login successful!');
      return res.redirect('/');
    });
  })(req, res, next);
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log("getAllUsers Found users:", users.length);
    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers Error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};
//specific user by ID ---
const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log("getUserById Finding user with ID:", id);

  try {
    const user = await User.findById(id);
    if (!user) {
      console.log("getUserById User not found:", id);
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("getUserById Error:", error);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

const findUserByEmail = async (req, res) => {
  const { email } = req.params;
  console.log("findUserByEmail Searching for user with email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("findUserByEmail User not found:", email);
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("get UserByEmail Error:", error);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

const findAllUsersByEmail = async (req, res) => {
  const { email } = req.params;
  console.log("findUsersByEmail Searching for users with email:", email);

  try {
    const users = await User.find({ email });
    if (!users || users.length === 0) {
      console.log("findUsersByEmail No users found:", email);
      return res.status(404).json({ message: "No users found." });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("get UsersByEmail Error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
    
  }
};


const findUserByEmailforPassportHelp = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (err) {
    console.error('erro from the  method findUserByEmailInternal] Error:', err);
    throw err;
  }
};



// Find user by id this ia helper methods 
const findUserByIdForPassportHelper = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.error('Error from findUserByIdInternal  Error:', err);
    throw err;
  }
};
const logout = (req, res) => {
  console.log("logout Logging out user"); 
  req.logout((err) => {
      if (err) {
          console.error('Logout error:', err);
      }
      res.redirect('/');  // Redirect to homepage or login page
  });
};

// createPassword
const createPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).render('createPassword', {
        errorMessage: "Passwords do not match.",
        email
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).render('createPassword', { errorMessage: "User not found." });
    }

    user.password = password; 
    await user.save();
    console.log('Password created successfully for:', user.email);
    req.flash('success_msg', 'Your password was created. You can now log in.');
    return res.redirect('/login');

  } catch (error) {
    console.error('Error creating password:', error);
    res.status(500).render('createPassword', { errorMessage: "Failed to set password." });
  }

  
};

const renderForgotPasswordForm = async (req, res) =>{
  res.render('forgotPassword');
};


const forgotPasswordSendCode = async (req, res) => {
  const { email } = req.body;
  console.log("Email received:", email);

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("Search Query Executed");

    if (user && user.isActive) {
      const verificationCode = getVerificationCode(email);
      user.verificationGeneratedBySystem = verificationCode;
      await user.save();
      console.log("Verification code saved to user");

      const fullName = user.fullName;
      console.log("Send Verification Email Method Called");
      await sendVerificationEmail(email, fullName, verificationCode, user._id);

      return res.status(200).render('forgotPassword', {
        successMessage: "Verification Code sent to your email.",
      });
    } else {
      console.log("Invalid or inactive user");
      return res.status(400).render('forgotPassword', {
        errorMessage: "Please use a valid registered email address.",
      });
    }
  } catch (err) {
    console.error("forgotPasswordSendCode error:", err);
    return res.status(500).render('forgotPassword', {
      errorMessage: "An error occurred. Please try again later.",
    });
  }
};

const createGoogleUser = async (profile) => {
  try {
    const { displayName, emails, photos } = profile;
    const email = emails[0].value;

    const newUser = new User({
      fullName: displayName,
      email: email,
      profileImage: photos[0].value,
      isActive: true,
      emailVerified: true
    });

    await newUser.save();
    console.log('createGoogleUser: New user created via Google:', email);
    return newUser;

  } catch (err) {
    console.error('createGoogleUser Error:', err);
    throw err;
  }
};

const renderProfilePage = async (req, res) => {
  try {
    const user = req.user;

    // Step 1: Find the wishlist for this user
    const wishlist = await Wishlist.findOne({ user_id: user._id });

    // Step 2: Count wishlist items
    let wishlistCount = 0;
    if (wishlist) {
      wishlistCount = await WishlistItem.countDocuments({ wishlist_id: wishlist._id });
    }

    res.render('profile', {
      user,
      wishlistCount
    });
  } catch (err) {
    console.error('renderProfilePage Error:', err);
    res.status(500).send('Error loading profile');
  }
};


  module.exports = {
    registerNewUser,
    verifyEmailVerificationCode,
    renderRegisterPage,
    resendVerificationCode,
    renderVerificationPage,
    logout,
    updateProfile,
    deleteUser,
    loginUser,
    getAllUsers,
    getUserById,
    findUserByEmail,
    findUserByIdForPassportHelper,
    findUserByEmailforPassportHelp,
    findAllUsersByEmail,
    deleteAllUserbyEmail,
    createPassword,
    userLogin,
    renderForgotPasswordForm,
    forgotPasswordSendCode,
    createGoogleUser,
    renderProfilePage

};


  