const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { verifyToken, requireSuperAdmin } = require('../middleware/auth.middleware');
const {
    validateRequired,
    validateEmail,
    validatePasswordStrength,
    checkUnique,
} = require('../middleware/validation.middleware');

// All routes require super_admin
router.use(verifyToken, requireSuperAdmin);

router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.post(
    '/',
    validateRequired(['full_name', 'email', 'password', 'role_id']),
    validateEmail('email'),
    validatePasswordStrength('password'),
    checkUnique({ table: 'users', column: 'email' }),
    userController.save
);
router.patch(
    '/update/:id',
    validateRequired(['full_name', 'email', 'role_id']),
    validateEmail('email'),
    validatePasswordStrength('password'),
    checkUnique({ table: 'users', column: 'email' }),
    userController.updateById
);
router.delete('/:id', userController.deleteById);

module.exports = router;
