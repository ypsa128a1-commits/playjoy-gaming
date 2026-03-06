/**
 * Stats Controller
 * Handles statistics endpoints
 */

const Game = require('../models/Game');
const User = require('../models/User');

/**
 * Get site statistics
 */
async function getStats(req, res) {
  try {
    const [totalGames, totalViews, totalUsers] = await Promise.all([
      Game.count(),
      Game.totalViews(),
      User.count()
    ]);

    res.json({
      totalGames,
      totalViews,
      totalUsers
    });
  } catch (err) {
    console.error('GET STATS ERROR:', err);
    res.json({ totalGames: 0, totalViews: 0, totalUsers: 0 });
  }
}

/**
 * Health check endpoint
 */
function healthCheck(req, res) {
  const { isReady } = require('../config/database');

  res.json({
    success: true,
    message: 'Gaming Hub API is running',
    dbReady: isReady(),
    timestamp: new Date().toISOString(),
    version: '2026-v5-MVC-ARCHITECTURE'
  });
}

module.exports = {
  getStats,
  healthCheck
};
