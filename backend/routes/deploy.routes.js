/**
 * Deploy Routes
 * Routes for deploy functionality - LAB ONLY
 * These routes are only available when accessed from lab environment
 */

const express = require('express');
const router = express.Router();
const deployController = require('../controllers/deployController');
const { authMiddleware, adminMiddleware } = require('../middlewares');

// Lab-only check middleware
const labOnly = (req, res, next) => {
  const isLabMode = req.headers['x-lab-mode'] === 'true' || 
                    req.cookies?.lab_access === 'granted';
  if (!isLabMode) {
    return res.status(403).json({ 
      success: false, 
      message: 'Deploy functionality only available in Lab mode' 
    });
  }
  next();
};

// Public routes - also restricted to lab only now
router.get('/check-changes', labOnly, deployController.checkForChanges);
router.get('/auto-changelog', labOnly, deployController.getAutoChangelog);
router.get('/history', labOnly, deployController.getHistory);

// Admin routes - LAB ONLY
router.post('/to-production', labOnly, authMiddleware, adminMiddleware, deployController.deployToProduction);
router.post('/rollback', labOnly, authMiddleware, adminMiddleware, deployController.rollback);

module.exports = router;
