import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all products with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('lowStock');
    
    let query = `
      SELECT p.*, c.category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.category_id 
      WHERE p.is_active = TRUE
    `;
    const params = [];
    
    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (p.product_name LIKE ? OR p.barcode LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (lowStock === 'true') {
      query += ' AND p.stock_quantity <= p.reorder_level';
    }
    
    query += ' ORDER BY p.product_name';
    
    const [products] = await pool.execute(query, params);
    
    return NextResponse.json({ 
      success: true, 
      data: products 
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      product_name, 
      category_id, 
      barcode, 
      price, 
      cost_price,
      stock_quantity, 
      reorder_level, 
      unit,
      description 
    } = body;
    
    // Validate required fields
    if (!product_name || !price) {
      return NextResponse.json(
        { success: false, message: 'Product name and price are required' },
        { status: 400 }
      );
    }
    
    const [result] = await pool.execute(
      `INSERT INTO products 
       (product_name, category_id, barcode, price, cost_price, stock_quantity, reorder_level, unit, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_name, category_id, barcode, price, cost_price, stock_quantity || 0, reorder_level || 10, unit || 'piece', description]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product created successfully',
      data: { product_id: result.insertId } 
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}