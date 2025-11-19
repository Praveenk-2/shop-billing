import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all categories
export async function GET() {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY category_name'
    );
    
    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST new category
export async function POST(request) {
  try {
    const { category_name, description } = await request.json();
    
    if (!category_name) {
      return NextResponse.json(
        { success: false, message: 'Category name is required' },
        { status: 400 }
      );
    }
    
    const [result] = await pool.execute(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Category created successfully',
      data: { category_id: result.insertId } 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}