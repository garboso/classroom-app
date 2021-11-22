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
    const user =
      await User.findById(req.params.id).select('name email educator updatedAt createdAt');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found.'});
    }
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body);

    if (user) {
      res.status(200).json({
        message: 'User data successfully updated.'
      });
    } else {
      res.status(404).json({
        error: 'User not found.'
      });
    }
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const destroy = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });

    res.status(200).json({
      message: 'User deleted successfully.'
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

module.exports = { create, index, show, update, destroy };