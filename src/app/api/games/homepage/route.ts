import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [featured] = await db.query(
      'SELECT * FROM games WHERE is_featured = 1 AND is_active = 1 ORDER BY views DESC LIMIT 10'
    );

    const [popular] = await db.query(
      'SELECT * FROM games WHERE is_active = 1 ORDER BY views DESC LIMIT 20'
    );

    const [recent] = await db.query(
      'SELECT * FROM games WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20'
    );

    const [categories] = await db.query(
      'SELECT category, COUNT(*) as count FROM games WHERE is_active = 1 GROUP BY category ORDER BY count DESC'
    );

    // Get games for each category
    const categoryGames = [];
    const categoryList = Array.isArray(categories) ? categories.slice(0, 8) : [];
    
    for (const cat of categoryList) {
      try {
        const [games] = await db.query(
          'SELECT * FROM games WHERE category = ? AND is_active = 1 ORDER BY views DESC LIMIT 10',
          [cat.category]
        );
        categoryGames.push({ 
          category: cat.category, 
          games: Array.isArray(games) ? games : [] 
        });
      } catch (e) {
        console.error(`Error fetching games for category ${cat.category}:`, e);
        categoryGames.push({ category: cat.category, games: [] });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        featured: Array.isArray(featured) ? featured : [],
        popular: Array.isArray(popular) ? popular : [],
        recent: Array.isArray(recent) ? recent : [],
        categories: Array.isArray(categories) ? categories : [],
        categoryGames
      }
    });
  } catch (error) {
    console.error('GET /api/games/homepage error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch homepage data' },
      { status: 500 }
    );
  }
}
