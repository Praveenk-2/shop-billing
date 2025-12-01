'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Table from '@/components/ui/Table';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const billColumns = [
    { header: 'Bill #', accessor: 'bill_number' },
    { header: 'Customer', accessor: 'customer_name', render: (row) => row.customer_name || 'Walk-in' },
    { header: 'Amount', accessor: 'total_amount', render: (row) => formatCurrency(row.total_amount) },
    { header: 'Date', accessor: 'bill_date', render: (row) => formatDateTime(row.bill_date) },
    { header: 'Status', accessor: 'payment_status', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {row.payment_status}
        </span>
    )}
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Today's Sales</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(stats?.today?.total_sales || 0)}
              </p>
              <p className="text-sm mt-1 opacity-80">
                {stats?.today?.total_bills || 0} bills
              </p>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Monthly Sales</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(stats?.monthly_sales || 0)}
              </p>
            </div>
            <div className="text-5xl opacity-50">📊</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Products</p>
              <p className="text-3xl font-bold mt-1">{stats?.total_products || 0}</p>
              <p className="text-sm mt-1 opacity-80">
                {stats?.low_stock_count || 0} low stock
              </p>
            </div>
            <div className="text-5xl opacity-50">📦</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{stats?.total_customers || 0}</p>
            </div>
            <div className="text-5xl opacity-50">👥</div>
          </div>
        </Card>
      </div>
      
      {/* Recent Bills */}
      <Card title="Recent Bills" className="mt-6">
        <Table columns={billColumns} data={stats?.recent_bills || []} />
      </Card>
    </div>
  );
}