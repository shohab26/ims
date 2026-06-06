const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth.middleware');

// All routes require super_admin
router.use(verifyToken, requireSuperAdmin);

router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.post('/', userController.save);
router.patch('/update/:id', userController.updateById);
router.delete('/:id', userController.deleteById);

module.exports = router;
