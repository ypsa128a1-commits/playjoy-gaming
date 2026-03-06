import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [categories] = await db.query(
      `SELECT category, COUNT(*) as count FROM games WHERE is_active = 1 GROUP BY category ORDER BY count DESC`
    );

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('GET /api/games/categories error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
