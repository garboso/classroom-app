const User = require('../models/User');
const errorHandler = require('../helpers/dbErrorHandler');

const create = async (req, res) => {
  const user = new User(req.body);

  try {
    const savedUser = await user.save();
    res.status(200).json({
      message: 'User signed up.',
      _id: savedUser._id
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
}

const index = async (req, res) => {
  try {
    const users = await User.find().select('name email educator updatedAt createdAt');
    res.json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const show = async (req, res) => {
  try {
    res.json({
      name: req.profile.name,
      email: req.profile.email,
      educator: req.profile.educator,
      createdAt: req.profile.createdAt,
      updatedAt: req.profile.updatedAt
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const update = async (req, res) => {
  try {
    const user = Object.assign(req.profile, req.body);
    user.updateAt = Date.now();

    await user.save();

    res.status(200).json({
      message: 'User data successfully updated.'
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const destroy = async (req, res) => {
  try {
    await req.profile.remove();

    res.status(200).json({
      message: 'User deleted successfully.'
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);

    if (user) {
      req.profile = user;
      next();
    } else {
      return res.status(400).json({
        error: 'User not found.'
      });
    }
  } catch (exc) {
    return res.status(400).json({
      error: 'Could not retrieve user.'
    });
  }
}

module.exports = { create, index, show, update, destroy, userById };