/**
 * Setting Routes
 */

const express = require('express');
const router = express.Router();
const { checkDB, authMiddleware, adminMiddleware } = require('../middlewares');
const settingController = require('../controllers/settingController');

// Public routes
router.get('/', checkDB, settingController.getAll);

// Admin routes
router.put('/', checkDB, authMiddleware, adminMiddleware, settingController.update);

// Ads.txt routes
router.get('/ads-txt', checkDB, settingController.getAdsTxt);
router.put('/ads-txt', checkDB, authMiddleware, adminMiddleware, settingController.updateAdsTxt);

module.exports = router;
