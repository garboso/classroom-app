const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  hash: String,
  salt: String,
  role: {
    type: String,
    enum: {
      values: ['STUDENT', 'EDUCATOR'],
      message: '{VALUE} is not supported.'
    },
    required: true,
    set: (v) => v.toUpperCase()
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const KEYLENGTH = 512;
const ITERATIONS = 10000;
const DIGEST = "sha512";
const ENCODING = "hex";

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, ITERATIONS, KEYLENGTH, DIGEST)
    .toString(ENCODING);
};

UserSchema.methods.validatePassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, ITERATIONS, KEYLENGTH, DIGEST)
    .toString(ENCODING);
  return this.hash === hash;
};

module.exports = mongoose.model('User', UserSchema);