// Set NODE_PATH before loading modules (for Passenger compatibility)
process.env.NODE_PATH = process.env.NODE_PATH || '/home/aurazenm/nodevenv/game/22/lib/node_modules';
require('module').Module._initPaths();

// Make dotenv optional - use try-catch for environments without it
try {
  require("dotenv").config();
} catch (e) {
  // dotenv not available, using environment variables directly
}

const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const https = require("https");

const app = express();

// ================= ENV =================
const {
  DB_HOST = "localhost",
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  JWT_SECRET = "aurazen_super_secret_2026",
  NODE_ENV
} = process.env;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= DATABASE =================
let db;
let dbReady = false;

async function initDB() {
  try {
    db = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });

    dbReady = true;
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
}

// Initialize DB immediately
initDB();

// Middleware to check DB
const checkDB = (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  next();
};

// ================= GAME CATEGORY ROUTES =================
// Get games by category
app.get("/api/games/category/:category", checkDB, async (req, res) => {
  try {
    const category = req.params.category;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const [rows] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       WHERE category = ? AND active = 1
       ORDER BY views DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      [category, limit, offset]
    );
    
    res.json({ success: true, data: rows, category });
  } catch (err) {
    console.error("GET GAMES BY CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get games by category" });
  }
});

// Get games by category with pagination
app.get("/api/games/categories/:category", checkDB, async (req, res) => {
  try {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Get total count - using COALESCE to handle potential nulls
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM games 
       WHERE category = ? AND COALESCE(active, 1) = 1`,
      [category]
    );
    
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    
    // Get games for this page - using COALESCE to handle potential nulls
    const [rows] = await db.query(
      `SELECT *, COALESCE(iframe_url, url) as url FROM games 
       WHERE category = ? AND COALESCE(active, 1) = 1
       ORDER BY views DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      [category, limit, offset]
    );
    
    res.json({
      success: true,
      data: rows,
      category,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("GET GAMES BY CATEGORY WITH PAGINATION ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get games by category" });
  }
});

// ================= AUTH MIDDLEWARE =================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.query("SELECT id, username, role, name FROM users WHERE id = ?", [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

// ================= AUTH ROUTES =================

// Register
app.post("/api/auth/register", checkDB, async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, 'user')",
      [username, hashedPassword, name || username]
    );

    const token = jwt.sign({ id: result.insertId, username, role: 'user' }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        user: { id: result.insertId, username, name: name || username, role: 'user' },
        token
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// Login
app.post("/api/auth/login", checkDB, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginUser = username || email;

    if (!loginUser || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? LIMIT 1",
      [loginUser]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "User tidak ditemukan" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        },
        token
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// Logout
app.post("/api/auth/logout", async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: "Logout berhasil" });
});

// Get current user
app.get("/api/auth/me", checkDB, authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// Change password
app.put("/api/auth/password", checkDB, authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);

    res.json({ success: true, message: "Password berhasil diubah" });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// ================= GAMES ROUTES =================

// Get homepage data (Netflix-style)
app.get("/api/games/homepage", checkDB, async (req, res) => {
  try {
    const featuredLimit = parseInt(req.query.featuredLimit) || 5;
    const categoryLimit = parseInt(req.query.categoryLimit) || 12;

    const [featured] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       WHERE featured = 1 
       ORDER BY views DESC, created_at DESC 
       LIMIT ${featuredLimit}`
    );

    const [popular] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       ORDER BY views DESC, created_at DESC 
       LIMIT 15`
    );

    const [recent] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       ORDER BY created_at DESC 
       LIMIT 15`
    );

    const [categories] = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM games 
       WHERE category IS NOT NULL 
       GROUP BY category 
       ORDER BY count DESC`
    );

    const categoriesWithGames = [];
    for (const cat of categories) {
      const [games] = await db.query(
        `SELECT *, iframe_url as url FROM games 
         WHERE category = ? 
         ORDER BY views DESC, created_at DESC 
         LIMIT ${categoryLimit}`,
        [cat.category]
      );
      if (games.length > 0) {
        categoriesWithGames.push({
          category: cat.category,
          count: cat.count,
          games: games
        });
      }
    }

    res.json({
      success: true,
      data: {
        featured,
        popular,
        recent,
        categories: categoriesWithGames
      }
    });

  } catch (err) {
    console.error("GET HOMEPAGE ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get homepage data" });
  }
});

// Get featured games
app.get("/api/games/featured", checkDB, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       WHERE featured = 1 
       ORDER BY views DESC, created_at DESC 
       LIMIT ${limit}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET FEATURED ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get featured games" });
  }
});

// Get popular games
app.get("/api/games/popular", checkDB, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       ORDER BY views DESC, created_at DESC 
       LIMIT ${limit}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET POPULAR ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get popular games" });
  }
});

// Get recent games
app.get("/api/games/recent", checkDB, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db.query(
      `SELECT *, iframe_url as url FROM games 
       ORDER BY created_at DESC 
       LIMIT ${limit}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET RECENT ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get recent games" });
  }
});

// Get categories
app.get("/api/games/categories", checkDB, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT category, COUNT(*) as count 
       FROM games 
       WHERE category IS NOT NULL 
       GROUP BY category 
       ORDER BY count DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to get categories" });
  }
});

// Get all games with pagination support
app.get("/api/games", checkDB, async (req, res) => {
  try {
    const { search, sort, featured, category, page, limit } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;
    
    let countSql = "SELECT COUNT(*) as total FROM games WHERE 1=1";
    let sql = "SELECT *, iframe_url as url FROM games WHERE 1=1";
    const params = [];
    const countParams = [];

    if (search) {
      sql += " AND (title LIKE ? OR description LIKE ?)";
      countSql += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (featured === '1') {
      sql += " AND featured = 1";
      countSql += " AND featured = 1";
    }

    if (category) {
      sql += " AND category = ?";
      countSql += " AND category = ?";
      params.push(category);
      countParams.push(category);
    }

    switch (sort) {
      case 'popular':
        sql += " ORDER BY views DESC";
        break;
      case 'oldest':
        sql += " ORDER BY created_at ASC";
        break;
      default:
        sql += " ORDER BY created_at DESC";
    }

    if (page || limit) {
      const [countResult] = await db.query(countSql, countParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limitNum);

      sql += ` LIMIT ${limitNum} OFFSET ${offset}`;
      
      const [rows] = await db.query(sql, params);
      
      res.json({
        success: true,
        data: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } else {
      const [rows] = await db.query(sql, params);
      res.json(rows);
    }

  } catch (err) {
    console.error("GET GAMES ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data game" });
  }
});

// Get single game
app.get("/api/games/:id", checkDB, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT *, iframe_url as url FROM games WHERE id = ?", [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Game tidak ditemukan" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("GET GAME ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data game" });
  }
});

// Increment view count
app.post("/api/games/:id/view", checkDB, async (req, res) => {
  try {
    await db.query("UPDATE games SET views = views + 1 WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "View recorded" });
  } catch (err) {
    console.error("VIEW ERROR:", err);
    res.status(500).json({ success: false, message: "Failed to record view" });
  }
});

// Create game (admin only)
app.post("/api/games", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, category, thumbnail, iframe_url, featured } = req.body;

    if (!title || !iframe_url) {
      return res.status(400).json({ success: false, message: "Title dan iframe_url wajib diisi" });
    }

    const [result] = await db.query(
      "INSERT INTO games (title, description, category, thumbnail, iframe_url, featured) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description || '', category || 'action', thumbnail || '', iframe_url, featured || 0]
    );

    const [newGame] = await db.query("SELECT *, iframe_url as url FROM games WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, message: "Game berhasil ditambahkan", data: newGame[0] });

  } catch (err) {
    console.error("CREATE GAME ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menambahkan game" });
  }
});

// Update game (admin only)
app.put("/api/games/:id", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, category, thumbnail, iframe_url, featured } = req.body;

    await db.query(
      "UPDATE games SET title = ?, description = ?, category = ?, thumbnail = ?, iframe_url = ?, featured = ? WHERE id = ?",
      [title, description, category, thumbnail, iframe_url, featured, req.params.id]
    );

    const [updatedGame] = await db.query("SELECT *, iframe_url as url FROM games WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Game berhasil diupdate", data: updatedGame[0] });

  } catch (err) {
    console.error("UPDATE GAME ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengupdate game" });
  }
});

// Delete game (admin only)
app.delete("/api/games/:id", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.query("DELETE FROM games WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Game berhasil dihapus" });
  } catch (err) {
    console.error("DELETE GAME ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal menghapus game" });
  }
});

// ================= ADS.TXT ROUTES =================

// Get ads.txt content
app.get("/api/ads-txt", async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const adsPath = path.join(__dirname, 'ads.txt');
    
    if (fs.existsSync(adsPath)) {
      const content = fs.readFileSync(adsPath, 'utf8');
      res.json({ success: true, content });
    } else {
      res.json({ success: true, content: '' });
    }
  } catch (err) {
    console.error("GET ADS.TXT ERROR:", err);
    res.json({ success: true, content: '' });
  }
});

// Update ads.txt (admin only)
app.put("/api/ads-txt", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { content } = req.body;
    
    const adsPath = path.join(__dirname, 'ads.txt');
    fs.writeFileSync(adsPath, content || '', 'utf8');
    
    res.json({ success: true, message: "Ads.txt berhasil diupdate" });
  } catch (err) {
    console.error("UPDATE ADS.TXT ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengupdate ads.txt" });
  }
});

// Serve ads.txt publicly
app.get("/ads.txt", (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const adsPath = path.join(__dirname, 'ads.txt');
    
    if (fs.existsSync(adsPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.sendFile(adsPath);
    } else {
      res.status(404).send('ads.txt not found');
    }
  } catch (err) {
    res.status(404).send('ads.txt not found');
  }
});

// ================= SETTINGS ROUTES =================

// Get settings
app.get("/api/settings", checkDB, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT `key`, `value` FROM settings");
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    res.json({ site_title: 'Aurazein' });
  }
});

// Update settings (admin only)
app.put("/api/settings", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await db.query(
        "INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?",
        [key, value, value]
      );
    }

    res.json({ success: true, message: "Settings berhasil diupdate" });

  } catch (err) {
    console.error("UPDATE SETTINGS ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengupdate settings" });
  }
});

// ================= STATS ROUTES =================

app.get("/api/stats", checkDB, async (req, res) => {
  try {
    const [gameCount] = await db.query("SELECT COUNT(*) as count FROM games");
    const [totalViews] = await db.query("SELECT SUM(views) as total FROM games");
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users");

    res.json({
      totalGames: gameCount[0]?.count || 0,
      totalViews: totalViews[0]?.total || 0,
      totalUsers: userCount[0]?.count || 0
    });

  } catch (err) {
    console.error("GET STATS ERROR:", err);
    res.json({ totalGames: 0, totalViews: 0, totalUsers: 0 });
  }
});

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Gaming Hub API is running",
    dbReady,
    timestamp: new Date().toISOString(),
    version: "2026-v4-DIRECT-IFRAME"
  });
});

// ================= LAB PASSWORD PROTECTION =================
const DEFAULT_LAB_PASSWORD = 'aurazein1997';

// Get lab password from settings or default
async function getLabPassword() {
  try {
    if (!dbReady) return DEFAULT_LAB_PASSWORD;
    const [rows] = await db.query("SELECT `value` FROM settings WHERE `key` = 'lab_password'");
    return rows[0]?.value || DEFAULT_LAB_PASSWORD;
  } catch (err) {
    return DEFAULT_LAB_PASSWORD;
  }
}

// Lab login page HTML
const LAB_LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Lab Access - Aurazein</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 28px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #ff6b6b, #ffa502);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: #888;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .input-group {
      margin-bottom: 20px;
      text-align: left;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #aaa;
      font-size: 13px;
    }
    input[type="password"] {
      width: 100%;
      padding: 14px 18px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      transition: all 0.3s;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #ff6b6b;
      box-shadow: 0 0 0 3px rgba(255,107,107,0.2);
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255,107,107,0.3);
    }
    .error {
      background: rgba(255,82,82,0.15);
      border: 1px solid rgba(255,82,82,0.3);
      color: #ff5252;
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 14px;
      display: none;
    }
    .back-link {
      margin-top: 20px;
      display: block;
      color: #888;
      text-decoration: none;
      font-size: 13px;
    }
    .back-link:hover { color: #fff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🔬</div>
    <h1>Lab Access</h1>
    <p class="subtitle">Development Environment</p>
    <div class="error" id="error"></div>
    <form id="loginForm">
      <div class="input-group">
        <label for="password">Enter Lab Password</label>
        <input type="password" id="password" placeholder="••••••••" required autofocus>
      </div>
      <button type="submit">Access Lab</button>
    </form>
    <a href="/" class="back-link">← Back to Main Site</a>
  </div>
  <script>
    
    // Redirect to bypass CDN cache
    if (!window.location.search.includes('t=')) {
      const randomParam = Math.random().toString(36).substring(2, 10);
      window.location.href = '/lab?t=' + randomParam;
    }

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const error = document.getElementById('error');

      try {
        const res = await fetch('/api/lab/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();

        if (data.success) {
          window.location.reload();
        } else {
          error.textContent = data.message || 'Invalid password';
          error.style.display = 'block';
        }
      } catch (err) {
        error.textContent = 'Connection error. Please try again.';
        error.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;

// Lab password verification API
app.post("/api/lab/verify", async (req, res) => {
  try {
    const { password } = req.body;
    const labPassword = await getLabPassword();

    if (password === labPassword) {
      // Set cookie for lab access (valid for 7 days)
      res.cookie('lab_access', 'granted', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.json({ success: true, message: 'Access granted' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid password' });
    }
  } catch (err) {
    console.error("LAB VERIFY ERROR:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Lab logout
app.post("/api/lab/logout", (req, res) => {
  res.clearCookie('lab_access');
  res.json({ success: true, message: 'Logged out from lab' });
});

// Change lab password (admin only)
app.put("/api/lab/password", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter" });
    }

    await db.query(
      "INSERT INTO settings (`key`, `value`) VALUES ('lab_password', ?) ON DUPLICATE KEY UPDATE `value` = ?",
      [password, password]
    );

    res.json({ success: true, message: "Lab password berhasil diubah" });
  } catch (err) {
    console.error("CHANGE LAB PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal mengubah lab password" });
  }
});

// Get lab status (admin only)
app.get("/api/lab/status", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const password = await getLabPassword();
    res.json({
      success: true,
      hasCustomPassword: password !== DEFAULT_LAB_PASSWORD,
      passwordLength: password.length
    });
  } catch (err) {
    res.json({ success: true, hasCustomPassword: false });
  }
});

// ================= DEPLOY TO PRODUCTION API =================
const { execSync, exec } = require('child_process');
const fs = require('fs');

app.post("/api/deploy/to-production", checkDB, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log('🚀 Deploy to Production started by admin...');
    
    const baseDir = path.join(__dirname);
    const labDistDir = path.join(baseDir, 'lab-dist');
    const prodDistDir = path.join(baseDir, 'dist');
    
    // Step 1: Copy lab-dist to dist (production frontend)
    console.log('📁 Copying lab-dist to dist...');
    if (fs.existsSync(prodDistDir)) {
      // Remove old dist
      fs.rmSync(prodDistDir, { recursive: true, force: true });
    }
    
    // Copy lab-dist to dist
    if (fs.existsSync(labDistDir)) {
      fs.cpSync(labDistDir, prodDistDir, { recursive: true });
      console.log('✅ Frontend files copied');
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'lab-dist folder not found. Build lab first!' 
      });
    }
    
    // Step 2: Remove IS_LAB flag from production files
    console.log('🔧 Removing lab flags from production...');
    const indexHtml = path.join(prodDistDir, 'index.html');
    if (fs.existsSync(indexHtml)) {
      let content = fs.readFileSync(indexHtml, 'utf8');
      // Remove IS_LAB script
      content = content.replace(/<script>window\.__IS_LAB__\s*=\s*true;<\/script>/gi, '');
      // Change noindex to index
      content = content.replace(/noindex,\s*nofollow,\s*noarchive/gi, 'index, follow');
      // Change title back
      content = content.replace(/🔬 Lab - Aurazein Development/gi, 'Aurazein - Play Free HTML5 Games Online');
      fs.writeFileSync(indexHtml, content);
      console.log('✅ Production index.html updated');
    }
    
    // Step 3: Restart Node.js server (using Passenger restart.txt)
    console.log('🔄 Triggering server restart...');
    const tmpDir = path.join(baseDir, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpDir, 'restart.txt'), new Date().toISOString());
    
    // Also kill and restart if possible
    try {
      // Kill existing node processes for this app (except current)
      exec('pkill -f "node.*app.js" 2>/dev/null || true', (error) => {
        // Start new process
        const nodePath = process.execPath;
        const env = {
          ...process.env,
          NODE_PATH: '/home/aurazenm/nodevenv/game/22/lib/node_modules'
        };
        exec(`cd ${baseDir} && NODE_PATH=/home/aurazenm/nodevenv/game/22/lib/node_modules nohup ${nodePath} app.js > ~/logs/game.log 2>&1 &`, { env });
      });
    } catch (e) {
      console.log('Note: Server restart signal sent via restart.txt');
    }
    
    console.log('✅ Deploy completed successfully!');
    res.json({ 
      success: true, 
      message: 'Production updated! Server restart initiated.' 
    });
    
  } catch (err) {
    console.error("DEPLOY ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Deploy failed: " + err.message 
    });
  }
});

// Lab access middleware - check cookie
const labAuthMiddleware = async (req, res, next) => {
  const labAccess = req.cookies?.lab_access;

  if (labAccess === 'granted') {
    return next();
  }

  // Return login page for HTML requests
  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.send(LAB_LOGIN_HTML);
  }

  // Return 401 for API requests
  res.status(401).json({ success: false, message: 'Lab access required' });
};

// ================= SEO ROUTES =================

// Dynamic Sitemap
app.get("/sitemap.xml", async (req, res) => {
  try {
    // Determine domain from request
    const host = req.get('host') || 'aurazein.id';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const [games] = await db.query("SELECT id, title, created_at FROM games ORDER BY created_at DESC LIMIT 1000");
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;
    
    for (const game of games) {
      const slug = game.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
      xml += `  <url>
    <loc>${baseUrl}/game/${game.id}/${slug}</loc>
    <lastmod>${game.created_at?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
    
    xml += `</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error("SITEMAP ERROR:", err);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt
app.get("/robots.txt", (req, res) => {
  // Determine domain from request
  const host = req.get('host') || 'aurazein.id';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`);
});

// ================= STATIC FRONTEND =================
// IMPORTANT: Lab routes must come BEFORE production static files

// Lab Router - handles all /lab routes with password protection
const labRouter = express.Router();

// Lab middleware for all lab routes
labRouter.use(async (req, res, next) => {
  const labAccess = req.cookies?.lab_access;

  if (labAccess === 'granted') {
    return next();
  }

  // Return login page for HTML requests
  if (req.accepts('html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.send(LAB_LOGIN_HTML);
  }

  // Return 401 for API requests
  res.status(401).json({ success: false, message: 'Lab access required' });
});

// Lab static files (after auth check)
labRouter.use(express.static(path.join(__dirname, 'lab-dist'), {
  index: false,
  setHeaders: (res, filePath) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// Lab SPA fallback - serve index.html for all lab routes
labRouter.get('*', (req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.sendFile(path.join(__dirname, 'lab-dist', 'index.html'));
});

// Mount lab router at /lab
app.use('/lab', labRouter);

// Production static files - serve from root
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Production SPA fallback
app.get("*", (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  if (req.path.startsWith('/lab')) {
    // This shouldn't happen as lab router should handle it, but just in case
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.sendFile(path.join(__dirname, 'lab-dist', 'index.html'));
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================= START SERVER (standalone mode) =================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Passenger
module.exports = app;