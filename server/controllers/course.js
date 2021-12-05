const Course = require('../models/Course');

const index = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (exc) {
    return res.status(400);
  }
}

const create = async (req, res) => {
  const course = new Course(req.body);
  course.instructor = req.profile;

  try {
    const savedCourse = await course.save();
    res.status(200).json({
      message: 'Course successfully created.',
      _id: savedCourse._id
    });
  } catch (exc) {
    return res.status(400);
  }
}

const listByInstructor = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.params.userId });
    res.json(courses);
  } catch (exc) {
    return res.status(400);
  }
};

const show = async (req, res) => {
  return res.json(req.course);
};

const update = async (req, res) => {
  try {
    const course = Object.assign(req.course, req.body);
    course.updateAt = Date.now();

    await course.save();

    return res.status(200).json({
      message: 'Course data successfully updated.'
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
};

const destroy = async (req, res) => {
  try {
    await req.course.remove();

    return res.status(200).json({
      message: 'Course deleted successfully.'
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    });
  }
}

const courseById = async (req, res, next, id) => {
  try {
    const course = await Course.findById(id);

    if (!course) {
      return res.status(400).json({
        error: 'Course not found.'
      });
    }

    req.course = course;
    next();
  } catch (exc) {
    return res.status(400).json({
      error: 'Could not retrieve course.'
    });
  }
};

const hasAuthorizationToChange = (req, res, next) => {
  if (String(req.course.instructor._id) !== String(req.profile._id)) {
    return res.status(403).json({
      error: 'User is not authorized.'
    });
  } else {
    next();
  }
}

module.exports = { create, index, show, listByInstructor, update, destroy, hasAuthorizationToChange, courseById };