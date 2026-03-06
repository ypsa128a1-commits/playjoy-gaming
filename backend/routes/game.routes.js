/**
 * Game Routes
 */

const express = require('express');
const router = express.Router();
const { checkDB, authMiddleware, adminMiddleware } = require('../middlewares');
const gameController = require('../controllers/gameController');

// Public routes
router.get('/homepage', checkDB, gameController.getHomepage);
router.get('/featured', checkDB, gameController.getFeatured);
router.get('/popular', checkDB, gameController.getPopular);
router.get('/recent', checkDB, gameController.getRecent);
router.get('/categories', checkDB, gameController.getCategories);
router.get('/', checkDB, gameController.getAll);
router.get('/:id', checkDB, gameController.getById);
router.post('/:id/view', checkDB, gameController.recordView);

// Admin routes
router.post('/', checkDB, authMiddleware, adminMiddleware, gameController.create);
router.put('/:id', checkDB, authMiddleware, adminMiddleware, gameController.update);
router.delete('/:id', checkDB, authMiddleware, adminMiddleware, gameController.remove);

module.exports = router;
