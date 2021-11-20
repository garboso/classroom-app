const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('../../config');
const User = require('../models/User');

const signIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      if (user.validatePassword(req.body.password)) {
        const token = jwt.sign({ _id: user._id }, config.jwtSecret);
        res.cookie('t', token, { expire: new Date() + 9999 });

        res.status(200).json({
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email
          }
        });
      } else {
        res.status(401).json({
          error: 'Email and password don\'t match.'
        });
      }
    } else {
      res.status(401).json({
        error: 'User not found.'
      });
    };
  } catch (err) {
    res.status(401).json({
      error: 'Couldn\'t sign in.'
    });
  }
}

const signOut = async (req, res) => {
  res.clearCookie('t');
  return res.status(200).json({
    message: 'User signed out.'
  })
};

const requireSignIn = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth',
  algorithms: ['HS256']
});

module.exports = { signIn, signOut, requireSignIn };