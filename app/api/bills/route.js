import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateBillNumber } from '@/lib/utils';

// GET all bills
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const customerId = searchParams.get('customerId');
    
    let query = `
      SELECT b.*, c.customer_name, u.full_name as cashier_name
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN users u ON b.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      query += ' AND DATE(b.bill_date) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND DATE(b.bill_date) <= ?';
      params.push(endDate);
    }
    
    if (customerId) {
      query += ' AND b.customer_id = ?';
      params.push(customerId);
    }
    
    query += ' ORDER BY b.bill_date DESC LIMIT 100';
    
    const [bills] = await pool.execute(query, params);
    
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

// POST new bill (with transaction)
export async function POST(request) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const body = await request.json();
    
    // Extract and validate data with default values
    const { 
      customer_id = null,  // Default to null instead of undefined
      user_id = 1,         // Default user ID
      items = [], 
      discount = 0,        // Default to 0
      tax = 0,            // Default to 0
      payment_method = 'cash', 
      payment_status = 'paid',
      amount_paid = 0,
      notes = null        // Default to null
    } = body;
    
    // Validate items
    if (!items || items.length === 0) {
      throw new Error('No items in cart');
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const total_amount = subtotal - discount + tax;
    
    // Generate bill number
    const [lastBill] = await connection.execute(
      'SELECT bill_number FROM bills ORDER BY bill_id DESC LIMIT 1'
    );
    const lastNumber = lastBill.length > 0 
      ? parseInt(lastBill[0].bill_number.split('-')[1]) 
      : 0;
    const bill_number = generateBillNumber(lastNumber);
    
    // Prepare values - convert undefined to null
    const customer_id_value = customer_id || null;
    const notes_value = notes || null;
    const amount_paid_value = amount_paid || total_amount;
    
    // Insert bill with explicit null handling
    const [billResult] = await connection.execute(
      `INSERT INTO bills 
       (bill_number, customer_id, user_id, subtotal, discount, tax, total_amount, payment_method, payment_status, amount_paid, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bill_number, 
        customer_id_value,  // Can be null
        user_id, 
        subtotal, 
        discount, 
        tax, 
        total_amount, 
        payment_method, 
        payment_status, 
        amount_paid_value, 
        notes_value  // Can be null
      ]
    );
    
    const bill_id = billResult.insertId;
    
    // Insert bill items and update stock
    for (const item of items) {
      // Check stock availability
      const [product] = await connection.execute(
        'SELECT stock_quantity, product_name FROM products WHERE product_id = ?',
        [item.product_id]
      );
      
      if (product.length === 0) {
        throw new Error(`Product ID ${item.product_id} not found`);
      }
      
      if (product[0].stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product[0].product_name}`);
      }
      
      // Calculate item total with default values
      const item_discount = item.discount || 0;
      const item_tax = item.tax || 0;
      const item_total = (item.quantity * item.unit_price) - item_discount + item_tax;
      
      // Insert bill item
      await connection.execute(
        `INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, discount, tax, total_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [bill_id, item.product_id, item.quantity, item.unit_price, item_discount, item_tax, item_total]
      );
      
      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
        [item.quantity, item.product_id]
      );
      
      // Log stock movement
      await connection.execute(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, created_by) 
         VALUES (?, 'out', ?, 'bill', ?, ?)`,
        [item.product_id, item.quantity, bill_id, user_id]
      );
    }
    
    // Update customer total purchases if customer exists
    if (customer_id_value) {
      await connection.execute(
        'UPDATE customers SET total_purchases = total_purchases + ? WHERE customer_id = ?',
        [total_amount, customer_id_value]
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