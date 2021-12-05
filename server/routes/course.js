const courseController = require('../controllers/course');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const router = require('express').Router();

router.get('/api/courses', courseController.index);

router.get('/api/course/:courseId', courseController.show);

router.get('/api/courses/by/:userId',
  authController.requireSignIn,
  courseController.listByInstructor
);

router.post('/api/course/by/:userId',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.isEducator,
  courseController.create
);

router.put('/api/course/:courseId/by/:userId',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.isEducator,
  courseController.hasAuthorizationToChange,
  courseController.update
);

router.delete('/api/course/:courseId/by/:userId',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.isEducator,
  courseController.hasAuthorizationToChange,
  courseController.destroy
);

router.param('userId', userController.userById);
router.param('courseId', courseController.courseById);

module.exports = router;