// app/api/bills/[id]/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    // ⭐ IMPORTANT: In Next.js 16, params is a Promise and must be awaited
    const { id } = await params;
    const billId = id;

    console.log('Fetching bill ID:', billId); // Debug log

    // Get bill details
    const [bills] = await pool.execute(
      `SELECT b.*, u.full_name as user_name, c.customer_name, c.phone as customer_phone
       FROM bills b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       WHERE b.bill_id = ?`,
      [billId]
    );

    console.log('Bills found:', bills.length); // Debug log

    if (bills.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bill not found' },
        { status: 404 }
      );
    }

    const bill = bills[0];

    // Get bill items with product details
    const [items] = await pool.execute(
      `SELECT bi.*, p.product_name
       FROM bill_items bi
       JOIN products p ON bi.product_id = p.product_id
       WHERE bi.bill_id = ?
       ORDER BY bi.item_id`,
      [billId]
    );

    console.log('Items found:', items.length); // Debug log

    // Combine bill and items
    const billData = {
      ...bill,
      items: items
    };

    return NextResponse.json({
      success: true,
      data: billData
    });

  } catch (error) {
    console.error('Get bill error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}