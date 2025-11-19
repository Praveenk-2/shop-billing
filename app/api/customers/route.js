import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all customers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let query = 'SELECT * FROM customers WHERE is_active = TRUE';
    const params = [];
    
    if (search) {
      query += ' AND (customer_name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY customer_name';
    
    const [customers] = await pool.execute(query, params);
    
    return NextResponse.json({ 
      success: true, 
      data: customers 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST new customer
export async function POST(request) {
  try {
    const { customer_name, phone, email, address } = await request.json();
    
    if (!customer_name) {
      return NextResponse.json(
        { success: false, message: 'Customer name is required' },
        { status: 400 }
      );
    }
    
    const [result] = await pool.execute(
      'INSERT INTO customers (customer_name, phone, email, address) VALUES (?, ?, ?, ?)',
      [customer_name, phone, email, address]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer created successfully',
      data: { customer_id: result.insertId } 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}