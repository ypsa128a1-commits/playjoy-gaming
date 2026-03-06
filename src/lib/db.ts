import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'aurazenm_root',
  password: process.env.DB_PASSWORD || 'aurazen2026root',
  database: process.env.DB_NAME || 'aurazenm_db',
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
