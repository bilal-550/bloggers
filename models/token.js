const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  for: {
    type: String,
    required: true
  },
  for_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
})

const Model = mongoose.model('Token', tokenSchema);

module.exports = Model