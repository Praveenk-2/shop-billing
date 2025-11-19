import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET today's bills summary
export async function GET() {
  try {
    const [summary] = await pool.execute(
      `SELECT 
        COUNT(*) as total_bills,
        SUM(total_amount) as total_sales,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'unpaid' THEN total_amount ELSE 0 END) as unpaid_amount
       FROM bills 
       WHERE DATE(bill_date) = CURDATE()`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: summary[0] 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}