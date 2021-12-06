const lessonController = require('../controllers/lesson');
const courseController = require('../controllers/course');
const authController = require('../controllers/auth');
const router = require('express').Router();

router.post('/api/course/:courseId/lesson/new',
	authController.requireSignIn,
	courseController.hasAuthorizationToChange,
	lessonController.create
);

router.param('courseId', courseController.courseById);

module.exports = router;