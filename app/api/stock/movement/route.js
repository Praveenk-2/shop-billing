import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET stock movements
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    let query = `
      SELECT sm.*, p.product_name, u.full_name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.product_id
      LEFT JOIN users u ON sm.created_by = u.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (productId) {
      query += ' AND sm.product_id = ?';
      params.push(productId);
    }
    
    query += ' ORDER BY sm.created_at DESC LIMIT 100';
    
    const [movements] = await pool.execute(query, params);
    
    return NextResponse.json({ 
      success: true, 
      data: movements 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST new stock movement
export async function POST(request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { product_id, movement_type, quantity, notes, created_by } = await request.json();
    
    // Validate
    if (!product_id || !movement_type || !quantity) {
      throw new Error('Missing required fields');
    }
    
    // Update product stock
    if (movement_type === 'in' || movement_type === 'adjustment') {
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE product_id = ?',
        [quantity, product_id]
      );
    } else if (movement_type === 'out') {
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [quantity, product_id]
      );
    }
    
    // Log movement
    await connection.execute(
      `INSERT INTO stock_movements (product_id, movement_type, quantity, notes, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [product_id, movement_type, quantity, notes, created_by]
    );
    
    await connection.commit();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stock updated successfully' 
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