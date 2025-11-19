import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single product
export async function GET(request, { params }) {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.category_id 
       WHERE p.product_id = ?`,
      [params.id]
    );
    
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: products[0] 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(request, { params }) {
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
      description,
      is_active
    } = body;
    
    await pool.execute(
      `UPDATE products 
       SET product_name = ?, category_id = ?, barcode = ?, price = ?, cost_price = ?,
           stock_quantity = ?, reorder_level = ?, unit = ?, description = ?, is_active = ?
       WHERE product_id = ?`,
      [product_name, category_id, barcode, price, cost_price, stock_quantity, reorder_level, unit, description, is_active, params.id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE product (soft delete)
export async function DELETE(request, { params }) {
  try {
    await pool.execute(
      'UPDATE products SET is_active = FALSE WHERE product_id = ?',
      [params.id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}