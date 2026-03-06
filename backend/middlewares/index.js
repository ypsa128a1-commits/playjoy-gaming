/**
 * Middlewares Index
 * Export all middlewares
 */

const { checkDB } = require('./db.middleware');
const { authMiddleware, adminMiddleware, labAccessMiddleware } = require('./auth.middleware');
const { ApiError, notFoundHandler, errorHandler, asyncHandler } = require('./error.middleware');

module.exports = {
  checkDB,
  authMiddleware,
  adminMiddleware,
  labAccessMiddleware,
  ApiError,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
