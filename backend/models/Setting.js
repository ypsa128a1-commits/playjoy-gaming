/**
 * Setting Model
 * Handles all settings-related database operations
 */

const { query } = require('../config/database');

const Setting = {
  /**
   * Get all settings as object
   */
  async getAll() {
    const rows = await query('SELECT `key`, `value` FROM settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  },

  /**
   * Get setting by key
   */
  async get(key) {
    const rows = await query(
      'SELECT `value` FROM settings WHERE `key` = ?',
      [key]
    );
    return rows[0]?.value || null;
  },

  /**
   * Set setting value (upsert)
   */
  async set(key, value) {
    await query(
      'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      [key, value, value]
    );
  },

  /**
   * Set multiple settings at once
   */
  async setMany(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
  }
};

module.exports = Setting;
