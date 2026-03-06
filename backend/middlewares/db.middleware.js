/**
 * Database Middleware
 * Check if database is ready
 */

const { isReady } = require('../config/database');

function checkDB(req, res, next) {
  if (!isReady()) {
    return res.status(503).json({
      success: false,
      message: 'Database not ready'
    });
  }
  next();
}

module.exports = { checkDB };
