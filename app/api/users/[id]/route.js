// import { NextResponse } from 'next/server';
// import pool from '@/lib/db';
// import { verifyToken } from '@/lib/auth';

// export async function PUT(request, { params }) {
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

//     const { is_active } = await request.json();

//     await pool.execute(
//       'UPDATE users SET is_active = ? WHERE user_id = ?',
//       [is_active, params.id]
//     );

//     return NextResponse.json({
//       success: true,
//       message: 'User status updated'
//     });
//   } catch (error) {
//     console.error('Update user error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Server error' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { is_active } = await request.json();

    await pool.execute(
      'UPDATE users SET is_active = ? WHERE user_id = ?',
      [is_active, params.id]
    );

    return NextResponse.json({
      success: true,
      message: 'User status updated'
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}