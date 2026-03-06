/**
 * Express Application Setup
 * Main application configuration
 */

// Set NODE_PATH before loading modules (for Passenger compatibility)
process.env.NODE_PATH = process.env.NODE_PATH || '/home/aurazenm/nodevenv/game/22/lib/node_modules';
require('module').Module._initPaths();

// Make dotenv optional
try {
  require('dotenv').config();
} catch (e) {
  // dotenv not available, using environment variables directly
}

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import database
const { initDB, isReady } = require('./config/database');

// Import middlewares
const { notFoundHandler, errorHandler } = require('./middlewares');

// Import routes
const routes = require('./routes');

// Create Express app
const app = express();

// ================= MIDDLEWARES =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================= DATABASE INITIALIZATION =================
initDB().catch(err => {
  console.error('Failed to initialize database:', err);
});

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Gaming Hub API is running',
    dbReady: isReady(),
    timestamp: new Date().toISOString(),
    version: '2026-v5-MVC-ARCHITECTURE'
  });
});

// ================= API ROUTES =================
app.use('/api', routes);

// ================= STATIC FILES (BEFORE LAB ACCESS CHECK) =================
// Serve production static files
app.use(express.static(path.join(__dirname, '..', 'dist'), {
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

// Serve lab static files (assets and root files like logo.svg)
// This must come BEFORE the lab access check
app.use('/lab', express.static(path.join(__dirname, '..', 'lab-dist'), {
  index: false, // Don't serve index.html automatically
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ================= LAB ACCESS CHECK =================
// Only check lab access for the main /lab route (not assets)
app.get('/lab', (req, res) => {
  const hasLabAccess = req.cookies?.lab_access === 'granted';
  
  if (!hasLabAccess) {
    const { getLabLoginHTML } = require('./middlewares/auth.middleware');
    return res.send(getLabLoginHTML());
  }
  
  // Serve lab index.html
  res.sendFile(path.join(__dirname, '..', 'lab-dist', 'index.html'));
});

// Handle /lab/ (with trailing slash)
app.get('/lab/', (req, res) => {
  const hasLabAccess = req.cookies?.lab_access === 'granted';
  
  if (!hasLabAccess) {
    const { getLabLoginHTML } = require('./middlewares/auth.middleware');
    return res.send(getLabLoginHTML());
  }
  
  // Serve lab index.html
  res.sendFile(path.join(__dirname, '..', 'lab-dist', 'index.html'));
});

// ================= SPA FALLBACK =================
app.get('*', (req, res) => {
  // API 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }

  // Lab SPA routes (after login)
  if (req.path.startsWith('/lab/')) {
    const hasLabAccess = req.cookies?.lab_access === 'granted';
    
    if (!hasLabAccess) {
      const { getLabLoginHTML } = require('./middlewares/auth.middleware');
      return res.send(getLabLoginHTML());
    }
    
    // Serve lab index.html for SPA routing
    return res.sendFile(path.join(__dirname, '..', 'lab-dist', 'index.html'));
  }

  // Production SPA fallback
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// ================= ERROR HANDLING =================
app.use(errorHandler);

// ================= EXPORT =================
module.exports = app;
