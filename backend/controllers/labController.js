/**
 * Lab Controller - Ultra Fast
 */

const fs = require('fs');
const path = require('path');
const Setting = require('../models/Setting');

// Password dari .env atau default
const DEFAULT_PASSWORD = process.env.LAB_PASSWORD || 'aurazein1997';
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const CHANGELOG_FILE = path.join(process.cwd(), 'changelog.json');

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Cache custom password
let customPassword = null;

async function verifyLabPassword(req, res) {
  const { password } = req.body;
  
  // INSTANT: check default password first (no DB)
  if (password === DEFAULT_PASSWORD) {
    res.cookie('lab_access', 'granted', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800000 });
    return res.json({ success: true, message: 'Access granted' });
  }
  
  // Check custom password if set
  if (customPassword && password === customPassword) {
    res.cookie('lab_access', 'granted', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800000 });
    return res.json({ success: true, message: 'Access granted' });
  }
  
  // Try DB for custom password
  try {
    const dbPassword = await Setting.get('lab_password');
    if (dbPassword && password === dbPassword) {
      customPassword = dbPassword;
      res.cookie('lab_access', 'granted', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 604800000 });
      return res.json({ success: true, message: 'Access granted' });
    }
  } catch (e) {}
  
  res.status(401).json({ success: false, message: 'Invalid password' });
}

function labLogout(req, res) {
  res.clearCookie('lab_access');
  res.json({ success: true, message: 'Logged out' });
}

async function changeLabPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Min 6 chars' });
    await Setting.set('lab_password', password);
    customPassword = password;
    res.json({ success: true, message: 'Password changed' });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
}

async function getLabStatus(req, res) {
  try {
    const pwd = await Setting.get('lab_password');
    res.json({ success: true, hasCustomPassword: !!pwd });
  } catch (e) { res.json({ success: true, hasCustomPassword: false }); }
}

async function getDeployChangelog(req, res) {
  try {
    if (fs.existsSync(CHANGELOG_FILE)) res.json({ success: true, changelog: JSON.parse(fs.readFileSync(CHANGELOG_FILE)) });
    else res.json({ success: true, changelog: [] });
  } catch (e) { res.json({ success: true, changelog: [] }); }
}

async function rollback(req, res) { res.json({ success: true, message: 'Coming soon' }); }
async function deployToProduction(req, res) { res.json({ success: true, message: 'Coming soon' }); }

module.exports = { verifyLabPassword, labLogout, changeLabPassword, getLabStatus, getDeployChangelog, rollback, deployToProduction };
