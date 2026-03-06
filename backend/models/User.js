/**
 * User Model
 * Handles all user-related database operations
 */

const { query } = require('../config/database');

const User = {
  /**
   * Find user by ID
   */
  async findById(id) {
    const rows = await query(
      'SELECT id, username, role, name FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find user by username
   */
  async findByUsername(username) {
    const rows = await query(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return rows[0] || null;
  },

  /**
   * Check if username exists
   */
  async exists(username) {
    const rows = await query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0;
  },

  /**
   * Create new user
   */
  async create({ username, password, name, role = 'user' }) {
    const result = await query(
      'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username, password, name || username, role]
    );
    return {
      id: result.insertId,
      username,
      name: name || username,
      role
    };
  },

  /**
   * Update user password
   */
  async updatePassword(userId, hashedPassword) {
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
  },

  /**
   * Count total users
   */
  async count() {
    const rows = await query('SELECT COUNT(*) as count FROM users');
    return rows[0]?.count || 0;
  }
};

module.exports = User;
