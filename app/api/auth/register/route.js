import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, email, password, full_name, role } = await request.json();
    
    // Validate required fields
    if (!username || !password || !full_name) {
      return NextResponse.json(
        { success: false, message: 'Username, password, and full name are required' },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Check if username already exists
    const [existingUsers] = await pool.execute(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists (if email provided)
    if (email) {
      const [existingEmails] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmails.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Set default role to cashier if not specified
    const userRole = role || 'cashier';

    // Insert new user
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [username, email, password_hash, full_name, userRole]
    );

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please login.',
      data: { user_id: result.insertId }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}