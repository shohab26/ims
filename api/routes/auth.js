const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/complete-password-change', authController.completePasswordChange);

// Protected route
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
