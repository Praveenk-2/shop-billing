import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single bill with items
export async function GET(request, { params }) {
  try {
    // Get bill details
    const [bills] = await pool.execute(
      `SELECT b.*, c.customer_name, c.phone, c.address, u.full_name as cashier_name
       FROM bills b
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       LEFT JOIN users u ON b.user_id = u.user_id
       WHERE b.bill_id = ?`,
      [params.id]
    );
    
    if (bills.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Bill not found' },
        { status: 404 }
      );
    }
    
    // Get bill items
    const [items] = await pool.execute(
      `SELECT bi.*, p.product_name
       FROM bill_items bi
       JOIN products p ON bi.product_id = p.product_id
       WHERE bi.bill_id = ?`,
      [params.id]
    );
    
    const bill = {
      ...bills[0],
      items
    };
    
    return NextResponse.json({ 
      success: true, 
      data: bill 
    });
  } catch (error) {
    console.error('Get bill error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE bill (with stock reversal)
export async function DELETE(request, { params }) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get bill items before deletion
    const [items] = await connection.execute(
      'SELECT product_id, quantity FROM bill_items WHERE bill_id = ?',
      [params.id]
    );
    
    // Restore stock
    for (const item of items) {
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
    }
    
    // Delete bill (cascade will delete bill_items)
    await connection.execute('DELETE FROM bills WHERE bill_id = ?', [params.id]);
    
    await connection.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bill deleted successfully' 
    });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}