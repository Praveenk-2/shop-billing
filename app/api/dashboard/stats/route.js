import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Today's sales
    const [todaySales] = await pool.execute(
      `SELECT 
        COUNT(*) as total_bills,
        COALESCE(SUM(total_amount), 0) as total_sales
       FROM bills 
       WHERE DATE(bill_date) = CURDATE()`
    );
    
    // This month's sales
    const [monthSales] = await pool.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as monthly_sales
       FROM bills 
       WHERE YEAR(bill_date) = YEAR(CURDATE()) 
       AND MONTH(bill_date) = MONTH(CURDATE())`
    );
    
    // Total products
    const [products] = await pool.execute(
      'SELECT COUNT(*) as total_products FROM products WHERE is_active = TRUE'
    );
    
    // Low stock products
    const [lowStock] = await pool.execute(
      'SELECT COUNT(*) as low_stock_count FROM products WHERE stock_quantity <= reorder_level AND is_active = TRUE'
    );
    
    // Total customers
    const [customers] = await pool.execute(
      'SELECT COUNT(*) as total_customers FROM customers WHERE is_active = TRUE'
    );
    
    // Recent bills
    const [recentBills] = await pool.execute(
      `SELECT b.*, c.customer_name
       FROM bills b
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       ORDER BY b.bill_date DESC
       LIMIT 5`
    );
    
    return NextResponse.json({
      success: true,
      data: {
        today: todaySales[0],
        monthly_sales: monthSales[0].monthly_sales,
        total_products: products[0].total_products,
        low_stock_count: lowStock[0].low_stock_count,
        total_customers: customers[0].total_customers,
        recent_bills: recentBills
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}