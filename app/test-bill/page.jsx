'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function TestBillPage() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBill = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: null,
          user_id: 1,
          items: [
            {
              product_id: 1,
              quantity: 2,
              unit_price: 100,
              discount: 0,
              tax: 36
            }
          ],
          discount: 0,
          tax: 36,
          payment_method: 'cash',
          payment_status: 'paid',
          amount_paid: 236,
          notes: null
        })
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Bill API</h1>
      <Button onClick={testBill} disabled={loading}>
        {loading ? 'Testing...' : 'Test Create Bill'}
      </Button>
      
      {response && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}