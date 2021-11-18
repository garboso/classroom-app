const userController = require('../controllers/user');
const router = require('express').Router();

router.get('/api/users/', userController.index);
router.get('/api/user/:id', userController.show);
router.post('/api/user/', userController.create);
router.put('/api/user/:id', userController.update);
router.delete('/api/user/:id', userController.destroy);

module.exports = router;