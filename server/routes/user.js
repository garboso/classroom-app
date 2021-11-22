const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const router = require('express').Router();

router.get('/api/users/', userController.index);
router.get('/api/user/:id',
  authController.requireSignIn, userController.show);
router.post('/api/user/', userController.create);
router.put('/api/user/:id',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.update);
router.delete('/api/user/:id',
  authController.requireSignIn,
  authController.hasAuthorization,
  userController.destroy);

module.exports = router;