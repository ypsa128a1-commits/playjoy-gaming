import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [games] = await db.query(
      `SELECT * FROM games WHERE is_active = 1 ORDER BY views DESC LIMIT 20`
    );

    return NextResponse.json({ success: true, data: games });
  } catch (error) {
    console.error('GET /api/games/popular error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch popular games' },
      { status: 500 }
    );
  }
}
