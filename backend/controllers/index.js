/**
 * Controllers Index
 * Export all controllers
 */

const authController = require('./authController');
const gameController = require('./gameController');
const settingController = require('./settingController');
const proxyController = require('./proxyController');
const labController = require('./labController');
const statsController = require('./statsController');

module.exports = {
  authController,
  gameController,
  settingController,
  proxyController,
  labController,
  statsController
};
