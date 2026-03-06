/**
 * Game Controller
 * Handles game-related endpoints
 */

const Game = require('../models/Game');

/**
 * Get homepage data (Netflix-style)
 */
async function getHomepage(req, res) {
  try {
    const featuredLimit = parseInt(req.query.featuredLimit) || 5;
    const categoryLimit = parseInt(req.query.categoryLimit) || 12;

    const data = await Game.getHomepageData(featuredLimit, categoryLimit);

    res.json({ success: true, data });
  } catch (err) {
    console.error('GET HOMEPAGE ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get homepage data'
    });
  }
}

/**
 * Get featured games
 */
async function getFeatured(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Game.getFeatured(limit);
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET FEATURED ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured games'
    });
  }
}

/**
 * Get popular games
 */
async function getPopular(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Game.getPopular(limit);
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET POPULAR ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular games'
    });
  }
}

/**
 * Get recent games
 */
async function getRecent(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await Game.getRecent(limit);
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET RECENT ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent games'
    });
  }
}

/**
 * Get categories
 */
async function getCategories(req, res) {
  try {
    const data = await Game.getCategories();
    res.json({ success: true, data });
  } catch (err) {
    console.error('GET CATEGORIES ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
}

/**
 * Get all games with pagination
 */
async function getAll(req, res) {
  try {
    const { search, sort, featured, category, page, limit, sortBy, sortOrder } = req.query;

    const result = await Game.findAll({
      search,
      sort,
      featured,
      category,
      page,
      limit,
      sortBy,
      sortOrder
    });

    if (page || limit) {
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } else {
      // Legacy response without pagination
      res.json(result.data);
    }
  } catch (err) {
    console.error('GET GAMES ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data game'
    });
  }
}

/**
 * Get single game
 */
async function getById(req, res) {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game tidak ditemukan'
      });
    }

    res.json(game);
  } catch (err) {
    console.error('GET GAME ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data game'
    });
  }
}

/**
 * Increment view count
 */
async function recordView(req, res) {
  try {
    await Game.incrementViews(req.params.id);
    res.json({ success: true, message: 'View recorded' });
  } catch (err) {
    console.error('VIEW ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to record view'
    });
  }
}

/**
 * Create game (admin only)
 */
async function create(req, res) {
  try {
    const { title, description, category, thumbnail, iframe_url, featured } = req.body;

    if (!title || !iframe_url) {
      return res.status(400).json({
        success: false,
        message: 'Title dan iframe_url wajib diisi'
      });
    }

    const game = await Game.create({
      title,
      description,
      category,
      thumbnail,
      iframe_url,
      featured
    });

    res.status(201).json({
      success: true,
      message: 'Game berhasil ditambahkan',
      data: game
    });
  } catch (err) {
    console.error('CREATE GAME ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan game'
    });
  }
}

/**
 * Update game (admin only)
 */
async function update(req, res) {
  try {
    const { title, description, category, thumbnail, iframe_url, featured } = req.body;

    const game = await Game.update(req.params.id, {
      title,
      description,
      category,
      thumbnail,
      iframe_url,
      featured
    });

    res.json({
      success: true,
      message: 'Game berhasil diupdate',
      data: game
    });
  } catch (err) {
    console.error('UPDATE GAME ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate game'
    });
  }
}

/**
 * Delete game (admin only)
 */
async function remove(req, res) {
  try {
    await Game.delete(req.params.id);
    res.json({ success: true, message: 'Game berhasil dihapus' });
  } catch (err) {
    console.error('DELETE GAME ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus game'
    });
  }
}

module.exports = {
  getHomepage,
  getFeatured,
  getPopular,
  getRecent,
  getCategories,
  getAll,
  getById,
  recordView,
  create,
  update,
  remove
};
