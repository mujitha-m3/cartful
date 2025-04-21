const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName :
    {
        type : String,required: true,trim:true
    },
    email: 
    {
        type:String, required:true, lowercase:true,trim:true
    },
    password: {
        type: String,required: true
      },
    gender: {
        type :String
    },
 
  dateOfBirth: {type :Date},
  language: {type:String},
  phone: {type:String, trim:true},
  profileImage: {type:String},
  addressLine1: {type:String},
  addressLine2: {type:String},
  city:{type:String},
  postalCode:{type:String},
  country:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  roles: {
type: [String],
    enum: ['user', 'admin'],default: ['user']},
isActive: {
    type: Boolean,default: true},
})

module.exports= mongoose.model('User',userSchema);