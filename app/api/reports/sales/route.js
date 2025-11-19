import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, month, year
    
    let dateFormat;
    switch(groupBy) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    let query = `
      SELECT 
        DATE_FORMAT(bill_date, ?) as period,
        COUNT(*) as total_bills,
        SUM(subtotal) as subtotal,
        SUM(discount) as total_discount,
        SUM(tax) as total_tax,
        SUM(total_amount) as total_sales
      FROM bills
      WHERE 1=1
    `;
    const params = [dateFormat];
    
    if (startDate) {
      query += ' AND DATE(bill_date) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(bill_date) <= ?';
      params.push(endDate);
    }
    
    query += ' GROUP BY period ORDER BY period DESC';
    
    const [sales] = await pool.execute(query, params);
    
    return NextResponse.json({
      success: true,
      data: sales
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}