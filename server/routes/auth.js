const authController = require('../controllers/auth');
const router = require('express').Router();

router.post('/signin', authController.signIn);

module.exports = router;