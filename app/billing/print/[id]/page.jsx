'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function PrintBillPage() {
  const params = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    fetchBill();
  }, []);

  useEffect(() => {
    if (bill) {
      setTimeout(() => window.print(), 500);
    }
  }, [bill]);

  const fetchBill = async () => {
    try {
      const res = await fetch(`/api/bills/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setBill(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!bill) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white">
      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-6 border-b-2 pb-4">
        <h1 className="text-3xl font-bold">Shop Billing System</h1>
        <p className="text-gray-600">Complete Retail Solution</p>
        <p className="text-sm text-gray-500">Phone: +91 1234567890 | Email: shop@example.com</p>
      </div>

      {/* Bill Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Bill Number:</p>
          <p className="font-bold text-lg">{bill.bill_number}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Date:</p>
          <p className="font-bold">{formatDateTime(bill.bill_date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Customer:</p>
          <p className="font-bold">{bill.customer_name || 'Walk-in Customer'}</p>
          {bill.phone && <p className="text-sm">{bill.phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Cashier:</p>
          <p className="font-bold">{bill.cashier_name}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-6 border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Item</th>
            <th className="border p-2 text-center">Qty</th>
            <th className="border p-2 text-right">Price</th>
            <th className="border p-2 text-right">Discount</th>
            <th className="border p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.product_name}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              <td className="border p-2 text-right">{formatCurrency(item.unit_price)}</td>
              <td className="border p-2 text-right">{formatCurrency(item.discount)}</td>
              <td className="border p-2 text-right font-semibold">{formatCurrency(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(bill.subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Discount:</span>
            <span className="text-red-600">- {formatCurrency(bill.discount)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax:</span>
            <span>{formatCurrency(bill.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t-2 pt-2">
            <span>Total:</span>
            <span>{formatCurrency(bill.total_amount)}</span>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>Payment Method:</span>
            <span className="uppercase">{bill.payment_method}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 border-t pt-4">
        <p className="font-semibold">Thank you for your business!</p>
        <p>Please visit again</p>
      </div>

      {/* Print Button */}
      <div className="no-print text-center mt-6">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Print Bill
        </button>
        <button
          onClick={() => window.close()}
          className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}