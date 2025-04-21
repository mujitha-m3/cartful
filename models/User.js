const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  gender: String,
  dateOfBirth: Date,
  language: String,
  phone: String,
  profileImage: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  postalCode: String,
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: true },
  roles: {
    type: [String],
    enum: ['user', 'admin'],
    default: ['user']
  },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  lastLogin: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
