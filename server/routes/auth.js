const authController = require('../controllers/auth');
const router = require('express').Router();

router.post('/signin', authController.signIn);
router.get('/signout', authController.signOut);

module.exports = router;