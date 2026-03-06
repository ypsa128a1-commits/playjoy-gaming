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

    const [categoryGames] = await Promise.all(
      (categories as any[]).slice(0, 8).map(async (cat: any) => {
        const [games] = await db.query(
          'SELECT * FROM games WHERE category = ? AND is_active = 1 ORDER BY views DESC LIMIT 10',
          [cat.category]
        );
        return { category: cat.category, games };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        featured,
        popular,
        recent,
        categories: categories,
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
