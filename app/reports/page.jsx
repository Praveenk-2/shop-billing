'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [salesData, setSalesData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState('day');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesReport();
    }
  }, [startDate, endDate, groupBy]);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/sales?startDate=${startDate}&endDate=${endDate}&groupBy=${groupBy}`);
      const data = await res.json();
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Period', accessor: 'period' },
    { header: 'Total Bills', accessor: 'total_bills' },
    { header: 'Subtotal', accessor: 'subtotal', render: (row) => formatCurrency(row.subtotal) },
    { header: 'Discount', accessor: 'total_discount', render: (row) => formatCurrency(row.total_discount) },
    { header: 'Tax', accessor: 'total_tax', render: (row) => formatCurrency(row.total_tax) },
    { header: 'Total Sales', accessor: 'total_sales', render: (row) => (
      <span className="font-bold text-green-600">{formatCurrency(row.total_sales)}</span>
    )}
  ];

  const totalSales = salesData.reduce((sum, row) => sum + parseFloat(row.total_sales), 0);
  const totalBills = salesData.reduce((sum, row) => sum + parseInt(row.total_bills), 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Sales Reports</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="day">Daily</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchSalesReport} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-4xl font-bold">{formatCurrency(totalSales)}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Bills</h3>
          <p className="text-4xl font-bold">{totalBills}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Average Bill</h3>
          <p className="text-4xl font-bold">
            {formatCurrency(totalBills > 0 ? totalSales / totalBills : 0)}
          </p>
        </Card>
      </div>

      <Card title="Sales Data">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Table columns={columns} data={salesData} />
        )}
      </Card>
    </div>
  );
}