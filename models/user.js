const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  emailToken: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false,
  }
})

const Model = mongoose.model('User', userSchema);
module.exports = Model