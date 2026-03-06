/**
 * Database Configuration
 * MySQL connection pool using mysql2
 */

const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_USER,
  DB_PASSWORD,
  DB_NAME
} = process.env;

let pool = null;
let dbReady = false;

/**
 * Initialize database connection pool
 */
async function initDB() {
  try {
    pool = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    dbReady = true;
    console.log('✅ Database connected');
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
}

/**
 * Get database pool
 */
function getPool() {
  return pool;
}

/**
 * Check if database is ready
 */
function isReady() {
  return dbReady;
}

/**
 * Execute query helper
 */
async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  initDB,
  getPool,
  isReady,
  query
};
