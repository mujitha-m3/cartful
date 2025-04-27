const mongoose = require('mongoose');
const crypto = require('crypto'); // for my get user veiriaion code and password hasing

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  gender: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  language:  { type: String, required: false },
  phone: { type: String, required: false },
  profileImage: { type: String, required: false },
  addressLine1:{ type: String, required: false },
  addressLine2: { type: String, required: false },
  city: { type: String, required: false },
  postalCode: { type: String, required: false },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: false },
  roles: {
    type: [String],
    enum: ['user', 'admin'],
    default: ['user']
  },
  verificationGeneratedBySystem: {
    type: String,
    required: false
  },
  verificationCodeUser: {
    type: String,
  default: null 
  },
  isActive: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
