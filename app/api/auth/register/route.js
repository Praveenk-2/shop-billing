import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, full_name, email, role } = body;

    // Validate required fields
    if (!username || !password || !full_name) {
      return NextResponse.json(
        { success: false, message: 'Username, password, and full name are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (username, password_hash, full_name, email, role, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [username, password_hash, full_name, email || null, role || 'cashier']
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: { user_id: result.insertId, username, full_name, role: role || 'cashier' }
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}