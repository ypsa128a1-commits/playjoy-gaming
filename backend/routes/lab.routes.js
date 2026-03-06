/**
 * Lab Routes
 * Handles lab access and deployment
 */

const express = require('express');
const router = express.Router();
const { checkDB, authMiddleware, adminMiddleware } = require('../middlewares');
const labController = require('../controllers/labController');

// Public routes
router.post('/verify', labController.verifyLabPassword);
router.post('/logout', labController.labLogout);

// Admin routes
router.get('/status', checkDB, authMiddleware, adminMiddleware, labController.getLabStatus);
router.put('/password', checkDB, authMiddleware, adminMiddleware, labController.changeLabPassword);

// Deploy routes (admin only)
router.get('/changelog', checkDB, authMiddleware, adminMiddleware, labController.getDeployChangelog);
router.post('/rollback', checkDB, authMiddleware, adminMiddleware, labController.rollback);
router.post('/deploy/to-production', checkDB, authMiddleware, adminMiddleware, labController.deployToProduction);

module.exports = router;
