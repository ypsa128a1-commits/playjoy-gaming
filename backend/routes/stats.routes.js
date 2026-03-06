/**
 * Stats Routes
 */

const express = require('express');
const router = express.Router();
const { checkDB } = require('../middlewares');
const statsController = require('../controllers/statsController');

// Public routes
router.get('/', checkDB, statsController.getStats);
router.get('/health', statsController.healthCheck);

module.exports = router;
