/**
 * Setting Controller
 * Handles settings endpoints
 */

const fs = require('fs');
const path = require('path');
const Setting = require('../models/Setting');

/**
 * Get all settings
 */
async function getAll(req, res) {
  try {
    const settings = await Setting.getAll();
    res.json(settings);
  } catch (err) {
    console.error('GET SETTINGS ERROR:', err);
    res.json({ site_title: 'Aurazein' });
  }
}

/**
 * Update settings (admin only)
 */
async function update(req, res) {
  try {
    await Setting.setMany(req.body);
    res.json({ success: true, message: 'Settings berhasil diupdate' });
  } catch (err) {
    console.error('UPDATE SETTINGS ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate settings'
    });
  }
}

/**
 * Get ads.txt content
 */
function getAdsTxt(req, res) {
  try {
    const adsPath = path.join(process.cwd(), 'ads.txt');

    if (fs.existsSync(adsPath)) {
      const content = fs.readFileSync(adsPath, 'utf8');
      res.json({ success: true, content });
    } else {
      res.json({ success: true, content: '' });
    }
  } catch (err) {
    console.error('GET ADS.TXT ERROR:', err);
    res.json({ success: true, content: '' });
  }
}

/**
 * Update ads.txt (admin only)
 */
function updateAdsTxt(req, res) {
  try {
    const adsPath = path.join(process.cwd(), 'ads.txt');
    const { content } = req.body;

    fs.writeFileSync(adsPath, content || '', 'utf8');
    res.json({ success: true, message: 'Ads.txt berhasil diupdate' });
  } catch (err) {
    console.error('UPDATE ADS.TXT ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate ads.txt'
    });
  }
}

/**
 * Serve ads.txt publicly
 */
function serveAdsTxt(req, res) {
  try {
    const adsPath = path.join(process.cwd(), 'ads.txt');

    if (fs.existsSync(adsPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.sendFile(adsPath);
    } else {
      res.status(404).send('ads.txt not found');
    }
  } catch (err) {
    res.status(404).send('ads.txt not found');
  }
}

module.exports = {
  getAll,
  update,
  getAdsTxt,
  updateAdsTxt,
  serveAdsTxt
};
