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
  hash: {
    type: String,
    required: 'Password is required.'
  },
  salt: String,
  educator: {
    type: Boolean,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

UserSchema.path('hash').validate(function () {
  if (this._password) {
    if (this._password.length < 12) {
      this.invalidate('password', 'Password must be at least 12 characters.', this._password.length);
    } else if (this._password.length > 36) {
      this.invalidate('password', 'Password must be less than 36 characters.', this._password.length);
    }
  }
});

UserSchema.virtual('password').set(function (password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hash = this.encryptPassword(password, this.salt);
});

UserSchema.methods.validatePassword = function (password) {
  return this.hash === this.encryptPassword(password);
};

UserSchema.methods.encryptPassword = function (password) {
  const KEYLENGTH = 512;
  const ITERATIONS = 10000;
  const DIGEST = "sha512";
  const ENCODING = "hex";

  return crypto
    .pbkdf2Sync(password, this.salt, ITERATIONS, KEYLENGTH, DIGEST)
    .toString(ENCODING);
}

UserSchema.methods.makeSalt = function () {
  return crypto.randomBytes(16).toString('hex');
}

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);