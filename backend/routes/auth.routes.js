/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const { checkDB, authMiddleware, adminMiddleware } = require('../middlewares');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', checkDB, authController.register);
router.post('/login', checkDB, authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', checkDB, authMiddleware, authController.getCurrentUser);
router.put('/password', checkDB, authMiddleware, authController.changePassword);

// Admin routes
router.post('/admin/change-password', checkDB, authMiddleware, adminMiddleware, authController.adminChangePassword);

module.exports = router;
