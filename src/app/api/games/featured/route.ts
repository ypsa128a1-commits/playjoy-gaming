import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [games] = await db.query(
      `SELECT * FROM games WHERE is_featured = 1 AND is_active = 1 ORDER BY views DESC LIMIT 10`
    );

    return NextResponse.json({ success: true, data: games });
  } catch (error) {
    console.error('GET /api/games/featured error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch featured games' },
      { status: 500 }
    );
  }
}
