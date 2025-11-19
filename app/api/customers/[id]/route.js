import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single customer
export async function GET(request, { params }) {
  try {
    const [customers] = await pool.execute(
      'SELECT * FROM customers WHERE customer_id = ?',
      [params.id]
    );
    
    if (customers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: customers[0] 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(request, { params }) {
  try {
    const { customer_name, phone, email, address } = await request.json();
    
    await pool.execute(
      'UPDATE customers SET customer_name = ?, phone = ?, email = ?, address = ? WHERE customer_id = ?',
      [customer_name, phone, email, address, params.id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Customer updated successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}