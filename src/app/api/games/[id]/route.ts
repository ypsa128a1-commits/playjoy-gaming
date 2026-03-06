import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [games] = await db.query(
      'SELECT * FROM games WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!games || (games as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Game not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: (games as any[])[0] });
  } catch (error) {
    console.error('GET /api/games/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}
