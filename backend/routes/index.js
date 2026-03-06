/**
 * Routes Index
 * Aggregates all routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const gameRoutes = require('./game.routes');
const settingRoutes = require('./setting.routes');
const proxyRoutes = require('./proxy.routes');
const labRoutes = require('./lab.routes');
const statsRoutes = require('./stats.routes');
const deployRoutes = require('./deploy.routes');
const settingController = require('../controllers/settingController');

// Mount routes
router.use('/auth', authRoutes);
router.use('/games', gameRoutes);
router.use('/settings', settingRoutes);
router.use('/proxy', proxyRoutes);
router.use('/lab', labRoutes);
router.use('/stats', statsRoutes);
router.use('/deploy', deployRoutes);

// Ads.txt public route
router.get('/ads.txt', settingController.serveAdsTxt);

module.exports = router;
