const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const router = require('express').Router();

router.param('userId', userController.userById);

router.get('/api/users/', userController.index);
router.get('/api/user/:userId',
  authController.requireSignIn, userController.show);
router.post('/api/user/', userController.create);
router.put('/api/user/:userId',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.update);
router.delete('/api/user/:userId',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.destroy);

module.exports = router;