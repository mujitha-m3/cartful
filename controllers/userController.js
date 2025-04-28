  const User = require('../models/user');
  const Country = require('../models/Country');
  const crypto = require('crypto');
  require('dotenv').config();
  const sendVerificationEmail = require('./emailController');
  const passport = require('passport');

  const getVerificationCode = (email) => {
    const randomCode = crypto.randomInt(1000, 9999).toString();
    const emailPrefix = email.trim().substring(0, 3);
    const verificationCode = randomCode + emailPrefix;
    console.log(" from method getVerificationCode Generated code:", verificationCode); //log
    return verificationCode;
};

  const registerNewUser = async (req,res)=> {
    console.log("Incomeing msg req data []",req.body);
    let {
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
      try
      {
          let newUser = new User(
            {
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
            emailVerified: false
          });
        newUser = await newUser.save();
        console.log("registerNewUser User saved:", newUser);
        const verificationCode = getVerificationCode(email);
        await User.findByIdAndUpdate(newUser._id, {
          verificationGeneratedBySystem: verificationCode
       
      });
      console.log("[registerNewUser] OTP saved to user:", verificationCode);
      sendVerificationEmail(email, fullName, verificationCode);
      console.log("registerNewUser veified", email);
      res.status(201).location('/api/users/${newUser._id}')
      .json({
        msg:"Registration successful. Please verify your email.",
          userId: newUser._id
      });
      }catch{
        console.error("[registerNewUser] Registration error:", error);
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
        
        console.log("[verifyEmailVerificationCode] User email verified successfully:", user.email);
        return res.status(200).json({ message: "Email verified successfully! You can now log in." });
      } else {
        console.log("[verifyEmailVerificationCode] Verification code mismatch!");
        return res.status(400).json({ message: "Verification code is incorrect. Please try again or request a new code." });
      }
  
    } catch (error) {
      console.error("Error during email verification:", error);
      res.status(500).json({ message: "Server error during verification." });
    }
  }; */

  const verifyEmailVerificationCode = async (req, res) => {
    const { email, fullName, veficode } = req.body; 
    console.log("[verifyEmailVerificationCode] Incoming:", { email, fullName, veficode }); 
  
    try {
      const user = await User.findOne({ email: email, fullName: fullName });
      if (!user) {
        console.log("[verifyEmailVerificationCode] User not found:", { email, fullName });
        return res.status(404).json({ message: "User not registered or email/fullName mismatch." });
      }
  
      if (user.verificationGeneratedBySystem === veficode) { 
        user.emailVerified = true;
        user.isActive = true;
        user.verificationGeneratedBySystem = null;
        await user.save();
        
        console.log("[verifyEmailVerificationCode] User email verified successfully:", user.email);
        return res.status(200).json({ message: "Email verified successfully! You can now log in." });
      } else {
        console.log("[verifyEmailVerificationCode] Verification code mismatch!");
        return res.status(400).json({ message: "Verification code is incorrect. Please try again or request a new code." });
      }
  
    } catch (error) {
      console.error("[verifyEmailVerificationCode] Error during email verification:", error);
      res.status(500).json({ message: "Server error during verification." });
    }
};
// looding Coutries
  const renderRegisterPage = async (req, res) => {
    try {
      const countries = await Country.find({ isActive: true }).sort({ name: 1 });
      console.log("countries check:", countries); 
      res.render('userRegister', { countries });
    } catch (error) {
      console.error('Error loading registration page:', error);
      res.status(500).send('Failed to load registration form.');
    }
  };
  const renderVerificationPage = (req, res) => {
    console.log(" Rendering email verification form"); 
    res.render('emailVerification');
  };

 /* const resendVerificationCode = async (req, res) => {
    const { email } = req.body;
    console.log("[resendVerificationCode] Request to resend code to:", email); 

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("[resendVerificationCode] User not found:", email);
            return res.status(404).json({ message: "User not registered." });
        }

        const verificationCode = getVerificationCode(email);
        user.verificationGeneratedBySystem = verificationCode;
        await user.save();

        sendVerificationEmail(email, user.fullName, verificationCode);
        console.log("New code sent to:", email); 

        res.status(200).json({ message: "Verification code resent successfully." });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error resending verification code." });
    }
}; */
const resendVerificationCode = async (req, res) => {
  const { email, fullName } = req.body;
  console.log("[resendVerificationCode] Request to resend code to:", { email, fullName }); 

  try {
      const user = await User.findOne({ email: email, fullName: fullName });
      if (!user) {
          console.log("[resendVerificationCode] User not found for email and fullName:", email, fullName);
          return res.status(404).json({ message: "User not registered or full name/email mismatch." });
      }
      const verificationCode = getVerificationCode(email);
      user.verificationGeneratedBySystem = verificationCode;
      await user.save();
      sendVerificationEmail(email, user.fullName, verificationCode);
      console.log("[resendVerificationCode] New verification code sent to:", email); 
      res.status(200).json({ message: "Verification code resent successfully." });
  } 
  catch (error) 
  {
      console.error("[resendVerificationCode] Error:", error);
      res.status(500).json({ message: "Error resending verification code." });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  const { fullName, email, phone, profileImage } = req.body;
  console.log("[updateProfile] Incoming update for user:", req.params.id);

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
      console.log("[updateProfile] User updated:", user._id);
      res.status(200).json({ message: 'Profile updated successfully.', user });

  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: 'Failed to update profile.' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { id, email, fullName } = req.body;
  console.log("[deleteUser] Deleting user based on:", { id, email, fullName });

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
      console.log("[deleteUser] User deleted.");
      res.status(200).json({ message: 'User deleted successfully!' });

  } catch (error) {
      console.error("[deleteUser] Error:", error);
      res.status(500).json({ message: 'Failed to delete user.' });
  }
};

//loginUser method
const loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(' Error:', err);
      return res.status(500).json({ message: 'Server error during login.' });
    }

    if (!user) {
      console.log('[Login API] Login failed:', info.message);
      return res.status(401).json({ message: info.message || 'Login failed.' });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('[Login API] Login error:', err);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
      }

      console.log('[Login API] Login successful for:', user.email);
      return res.status(200).json({ message: 'Login successful!', userId: user._id });
    });
  })(req, res, next);
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log("[getAllUsers] Found users:", users.length);
    res.status(200).json(users);
  } catch (error) {
    console.error("[getAllUsers] Error:", error);
    res.status(500).json({ message: "Failed to fetch users." });
  }
};
//specific user by ID ---
const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log("[getUserById] Finding user with ID:", id);

  try {
    const user = await User.findById(id);
    if (!user) {
      console.log("[getUserById] User not found:", id);
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("[getUserById] Error:", error);
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

const findUserByEmail = async (req, res) => {
  const { email } = req.params;
  console.log("[findUserByEmail] Searching for user with email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[findUserByEmail] User not found:", email);
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("[get UserByEmail Error:", error);
    res.status(500).json({ message: "Failed to fetch user." });
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

// Find user by id (internal use only, no req/res)
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
  console.log("[logout] Logging out user"); 
  req.logout((err) => {
      if (err) {
          console.error('Logout error:', err);
      }
      res.redirect('/');  // Redirect to homepage or login page
  });
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
    findUserByEmailforPassportHelp

};


  