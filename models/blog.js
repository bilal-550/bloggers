const mongoose = require('mongoose');
const shortid = require('shortid');

const blogSchema = mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate,
    required: true
  },
  title: {
    required: true,
    type: String
  },
  stringId: {
    required: true,
    type: String
  },
  description: {
    required: true,
    type: String
  },
  body: {
    required: true,
    type: String
  },
  createdAt: {
    default: Date.now,
    type: Date,
    required: true
  }
})

blogSchema.virtual('getCreatedAtDate').get(function () {
  const milliseconds = this.createdAt;
  const date = new Date(milliseconds);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

module.exports = mongoose.model('Blog', blogSchema)