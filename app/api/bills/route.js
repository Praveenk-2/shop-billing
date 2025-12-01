import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const body = await request.json();
    const { bill_number, customer_id, user_id, subtotal, discount, tax, 
            total_amount, payment_method, payment_status, amount_paid, notes, items } = body;
    
    console.log('Received bill data:', body); // Debug log
    
    // Insert bill
    const [billResult] = await connection.execute(
      `INSERT INTO bills (bill_number, customer_id, user_id, subtotal, discount, tax, 
       total_amount, payment_method, payment_status, amount_paid, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bill_number, customer_id, user_id, subtotal, discount, tax, 
       total_amount, payment_method, payment_status, amount_paid, notes]
    );
    
    const bill_id = billResult.insertId;
    console.log('Bill created with ID:', bill_id); // Debug log
    
    // Insert bill items & update stock
    for (const item of items) {
      await connection.execute(
        `INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, discount, tax, total_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bill_id, item.product_id, item.quantity, item.unit_price, item.discount || 0, item.tax || 0, item.total_price]
      );
      
      // Update product stock
      await connection.execute(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
        [item.quantity, item.product_id]
      );
    }
    
    await connection.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bill created successfully',
      data: { bill_id, bill_number }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create bill error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// GET all bills
export async function GET(request) {
  try {
    const [bills] = await pool.execute(
      `SELECT b.*, u.full_name as user_name, c.customer_name
       FROM bills b
       LEFT JOIN users u ON b.user_id = u.user_id
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       ORDER BY b.bill_id DESC
       LIMIT 100`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: bills 
    });
  } catch (error) {
    console.error('Get bills error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}