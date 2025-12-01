// app/billing/print/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PrintBillPage() {
  const params = useParams();
  const billId = params.id;
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillData();
  }, [billId]);

  const fetchBillData = async () => {
    try {
      const res = await fetch(`/api/bills/${billId}`);
      const data = await res.json();
      
      if (data.success) {
        setBillData(data.data);
      } else {
        alert('Bill not found');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      alert('Failed to load bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading bill...</div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Bill not found</div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 0.5cm;
            size: A4 portrait;
          }
        }
      `}</style>

      {/* Print Button - Hidden on print */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 shadow-lg"
        >
          🖨️ Print Bill
        </button>
      </div>

      {/* Bill Template */}
      <div className="max-w-4xl mx-auto p-8 bg-white">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">YOUR SHOP NAME</h1>
          <p className="text-sm text-gray-600">123 Main Street, City, State - 123456</p>
          <p className="text-sm text-gray-600">Phone: +91 12345 67890 | Email: shop@example.com</p>
          <p className="text-sm text-gray-600">GSTIN: 12ABCDE3456F7Z8</p>
        </div>

        {/* Bill Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm"><strong>Bill No:</strong> {billData.bill_number}</p>
            <p className="text-sm"><strong>Date:</strong> {new Date(billData.bill_date).toLocaleDateString('en-IN')}</p>
            <p className="text-sm"><strong>Time:</strong> {new Date(billData.bill_date).toLocaleTimeString('en-IN')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm"><strong>Cashier:</strong> {billData.user_name || 'N/A'}</p>
            <p className="text-sm"><strong>Payment:</strong> {billData.payment_method?.toUpperCase()}</p>
            <p className="text-sm"><strong>Status:</strong> <span className="text-green-600 font-semibold">{billData.payment_status?.toUpperCase()}</span></p>
          </div>
        </div>

        {/* Customer Info (if available) */}
        {billData.customer_name && (
          <div className="mb-6 p-3 bg-gray-50 rounded">
            <p className="text-sm"><strong>Customer:</strong> {billData.customer_name}</p>
            {billData.customer_phone && <p className="text-sm"><strong>Phone:</strong> {billData.customer_phone}</p>}
          </div>
        )}

        {/* Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-400 px-3 py-2 text-left text-sm">S.No</th>
              <th className="border border-gray-400 px-3 py-2 text-left text-sm">Product Name</th>
              <th className="border border-gray-400 px-3 py-2 text-center text-sm">Qty</th>
              <th className="border border-gray-400 px-3 py-2 text-right text-sm">Price</th>
              <th className="border border-gray-400 px-3 py-2 text-right text-sm">Discount</th>
              <th className="border border-gray-400 px-3 py-2 text-right text-sm">Tax</th>
              <th className="border border-gray-400 px-3 py-2 text-right text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {billData.items && billData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="border border-gray-400 px-3 py-2 text-sm">{index + 1}</td>
                <td className="border border-gray-400 px-3 py-2 text-sm">{item.product_name}</td>
                <td className="border border-gray-400 px-3 py-2 text-center text-sm">{item.quantity}</td>
                <td className="border border-gray-400 px-3 py-2 text-right text-sm">₹{Number(item.unit_price).toFixed(2)}</td>
                <td className="border border-gray-400 px-3 py-2 text-right text-sm">₹{Number(item.discount || 0).toFixed(2)}</td>
                <td className="border border-gray-400 px-3 py-2 text-right text-sm">₹{Number(item.tax || 0).toFixed(2)}</td>
                <td className="border border-gray-400 px-3 py-2 text-right text-sm font-semibold">₹{Number(item.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1 border-b">
              <span className="text-sm">Subtotal:</span>
              <span className="text-sm">₹{Number(billData.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-sm">Discount:</span>
              <span className="text-sm text-red-600">- ₹{Number(billData.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="text-sm">Tax (GST):</span>
              <span className="text-sm">₹{Number(billData.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-2">
              <span className="font-bold text-lg">Grand Total:</span>
              <span className="font-bold text-lg">₹{Number(billData.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm">Amount Paid:</span>
              <span className="text-sm text-green-600 font-semibold">₹{Number(billData.amount_paid || billData.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Total in Words */}
        <div className="mb-6 p-3 bg-gray-100 rounded">
          <p className="text-sm"><strong>Amount in Words:</strong> {numberToWords(billData.total_amount)} Rupees Only</p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8">
          <div className="text-center">
            <p className="text-sm font-semibold mb-2">Thank you for your business!</p>
            <p className="text-xs text-gray-600">This is a computer-generated invoice and does not require a signature.</p>
            <p className="text-xs text-gray-600 mt-2">Terms & Conditions: Goods once sold cannot be returned.</p>
          </div>
        </div>

        {/* Barcode/QR (Optional) */}
        <div className="text-center mt-6">
          <div className="inline-block border-2 border-gray-400 p-2">
            <p className="text-xs text-gray-600 mb-1">Scan for digital receipt</p>
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              QR CODE
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper function to convert number to words
function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const numStr = Math.floor(num).toString();
  let words = '';

  if (numStr.length > 5) {
    const lakhs = Math.floor(num / 100000);
    words += numberToWords(lakhs) + ' Lakh ';
    num %= 100000;
  }

  if (numStr.length > 3) {
    const thousands = Math.floor(num / 1000);
    if (thousands > 0) {
      words += numberToWords(thousands) + ' Thousand ';
      num %= 1000;
    }
  }

  if (num > 99) {
    const hundreds = Math.floor(num / 100);
    words += ones[hundreds] + ' Hundred ';
    num %= 100;
  }

  if (num > 19) {
    const tensPlace = Math.floor(num / 10);
    words += tens[tensPlace] + ' ';
    num %= 10;
  } else if (num > 9) {
    words += teens[num - 10] + ' ';
    return words;
  }

  if (num > 0) {
    words += ones[num] + ' ';
  }

  return words.trim();
}