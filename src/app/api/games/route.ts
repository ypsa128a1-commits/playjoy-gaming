import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'views';
    const order = searchParams.get('order') || 'DESC';

    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = 1';
    const params: any[] = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const validSorts = ['views', 'created_at', 'play_count', 'title'];
    const sortColumn = validSorts.includes(sort) ? sort : 'views';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const [games] = await db.query(
      `SELECT * FROM games ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM games ${whereClause}`,
      params
    );

    const total = (countResult as any[])[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: games,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GET /api/games error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
