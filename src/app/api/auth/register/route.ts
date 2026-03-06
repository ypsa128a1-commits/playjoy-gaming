import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, username, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing && (existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (email, username, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [email, username || email.split('@')[0], hashedPassword, name || username || email.split('@')[0], 'user']
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: (result as any).insertId
    });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    );
  }
}
