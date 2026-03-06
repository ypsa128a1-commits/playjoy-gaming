/**
 * Game Model
 * Handles all game-related database operations
 */

const { query } = require('../config/database');

const Game = {
  /**
   * Get featured games
   */
  async getFeatured(limit = 10) {
    return await query(
      `SELECT *, iframe_url as url FROM games 
       WHERE featured = 1 
       ORDER BY views DESC, created_at DESC 
       LIMIT ?`,
      [limit]
    );
  },

  /**
   * Get popular games
   */
  async getPopular(limit = 10) {
    return await query(
      `SELECT *, iframe_url as url FROM games 
       ORDER BY views DESC, created_at DESC 
       LIMIT ?`,
      [limit]
    );
  },

  /**
   * Get recent games
   */
  async getRecent(limit = 10) {
    return await query(
      `SELECT *, iframe_url as url FROM games 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );
  },

  /**
   * Get all games with filters and pagination
   */
  async findAll({ search, sort, featured, category, page, limit, sortBy, sortOrder }) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = (pageNum - 1) * limitNum;

    let countSql = 'SELECT COUNT(*) as total FROM games WHERE 1=1';
    let sql = 'SELECT *, iframe_url as url FROM games WHERE 1=1';
    const params = [];
    const countParams = [];

    // Search by name only (not description)
    if (search) {
      sql += ' AND title LIKE ?';
      countSql += ' AND title LIKE ?';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    if (featured === '1') {
      sql += ' AND featured = 1';
      countSql += ' AND featured = 1';
    }

    if (category) {
      sql += ' AND category = ?';
      countSql += ' AND category = ?';
      params.push(category);
      countParams.push(category);
    }

    // Sorting - new sortBy and sortOrder take precedence
    const order = sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    if (sortBy) {
      switch (sortBy) {
        case 'name':
          sql += ` ORDER BY title ${order}`;
          break;
        case 'release_date':
          sql += ` ORDER BY created_at ${order}`;
          break;
        case 'views':
          sql += ` ORDER BY views ${order}`;
          break;
        default:
          sql += ` ORDER BY created_at ${order}`;
      }
    } else {
      // Legacy sort parameter
      switch (sort) {
        case 'popular':
          sql += ' ORDER BY views DESC';
          break;
        case 'oldest':
          sql += ' ORDER BY created_at ASC';
          break;
        default:
          sql += ' ORDER BY created_at DESC';
      }
    }

    // Pagination
    sql += ` LIMIT ${limitNum} OFFSET ${offset}`;

    const [countResult] = await query(countSql, countParams);
    const total = countResult?.total || 0;
    const rows = await query(sql, params);

    return {
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    };
  },

  /**
   * Find game by ID
   */
  async findById(id) {
    const rows = await query('SELECT * FROM games WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * Create new game
   */
  async create({ title, description, category, thumbnail, iframe_url, featured }) {
    const result = await query(
      'INSERT INTO games (title, description, category, thumbnail, iframe_url, featured) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || '', category || 'action', thumbnail || '', iframe_url, featured || 0]
    );
    return await this.findById(result.insertId);
  },

  /**
   * Update game
   */
  async update(id, { title, description, category, thumbnail, iframe_url, featured }) {
    await query(
      'UPDATE games SET title = ?, description = ?, category = ?, thumbnail = ?, iframe_url = ?, featured = ? WHERE id = ?',
      [title, description, category, thumbnail, iframe_url, featured, id]
    );
    return await this.findById(id);
  },

  /**
   * Delete game
   */
  async delete(id) {
    await query('DELETE FROM games WHERE id = ?', [id]);
  },

  /**
   * Increment view count
   */
  async incrementViews(id) {
    await query('UPDATE games SET views = views + 1 WHERE id = ?', [id]);
  },

  /**
   * Get categories with count
   */
  async getCategories() {
    return await query(
      `SELECT category, COUNT(*) as count 
       FROM games 
       WHERE category IS NOT NULL 
       GROUP BY category 
       ORDER BY count DESC`
    );
  },

  /**
   * Get games by category
   */
  async getByCategory(category, limit = 12) {
    return await query(
      `SELECT *, iframe_url as url FROM games 
       WHERE category = ? 
       ORDER BY views DESC, created_at DESC 
       LIMIT ?`,
      [category, limit]
    );
  },

  /**
   * Get homepage data (Netflix-style)
   */
  async getHomepageData(featuredLimit = 5, categoryLimit = 12) {
    const featured = await this.getFeatured(featuredLimit);
    const popular = await this.getPopular(15);
    const recent = await this.getRecent(15);
    const categories = await this.getCategories();

    const categoriesWithGames = [];
    for (const cat of categories) {
      const games = await this.getByCategory(cat.category, categoryLimit);
      if (games.length > 0) {
        categoriesWithGames.push({
          category: cat.category,
          count: cat.count,
          games
        });
      }
    }

    return {
      featured,
      popular,
      recent,
      categories: categoriesWithGames
    };
  },

  /**
   * Count total games
   */
  async count() {
    const rows = await query('SELECT COUNT(*) as count FROM games');
    return rows[0]?.count || 0;
  },

  /**
   * Get total views
   */
  async totalViews() {
    const rows = await query('SELECT SUM(views) as total FROM games');
    return rows[0]?.total || 0;
  }
};

module.exports = Game;
