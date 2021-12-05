const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./User');

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required.'
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: Buffer,
    contentType: String
  },
  category: {
    type: String,
    required: 'Category is required.'
  },
  published: {
    type: Boolean,
    required: true,
    default: false
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);