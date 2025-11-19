// import { NextResponse } from 'next/server';
// import pool from '@/lib/db';
// import { verifyToken } from '@/lib/auth';

// export async function GET(request) {
//   try {
//     // Verify admin access
//     const token = request.cookies.get('token')?.value;
//     const decoded = verifyToken(token);
    
//     if (!decoded || decoded.role !== 'admin') {
//       return NextResponse.json(
//         { success: false, message: 'Unauthorized' },
//         { status: 403 }
//       );
//     }

//     const [users] = await pool.execute(
//       `SELECT user_id, username, email, full_name, role, is_active, created_at 
//        FROM users 
//        ORDER BY created_at DESC`
//     );

//     return NextResponse.json({
//       success: true,
//       data: users
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Server error' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const [users] = await pool.execute(
      `SELECT user_id, username, full_name, role, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}