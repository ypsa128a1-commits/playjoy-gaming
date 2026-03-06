/**
 * Proxy Routes
 */

const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxyController');

// Public proxy routes
router.get('/test', proxyController.testProxy);
router.get('/game-sandbox', proxyController.gameSandbox);
router.get('/game', proxyController.gameProxy);

module.exports = router;
