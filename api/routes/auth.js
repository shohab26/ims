const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateRequired, validateEmail, validatePasswordStrength } = require('../middleware/validation.middleware');

// Public routes
router.post('/login', validateRequired(['email', 'password']), validateEmail('email'), authController.login);
router.post(
    '/complete-password-change',
    validateRequired(['email', 'otp', 'new_password']),
    validateEmail('email'),
    validatePasswordStrength('new_password'),
    authController.completePasswordChange
);

// Protected route
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
