'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`/api/customers?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'customer_name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    { header: 'Total Purchases', accessor: 'total_purchases', render: (row) => formatCurrency(row.total_purchases) },
    { header: 'Loyalty Points', accessor: 'loyalty_points' },
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <Button
        variant="outline"
        onClick={() => {
          setEditCustomer(row);
          setShowModal(true);
        }}
        className="text-xs py-1"
      >
        Edit
      </Button>
    )}
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => {
          setEditCustomer(null);
          setShowModal(true);
        }}>
          Add Customer
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <Table columns={columns} data={customers} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditCustomer(null);
        }}
        title={editCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <CustomerForm
          customer={editCustomer}
          onSuccess={() => {
            setShowModal(false);
            setEditCustomer(null);
            fetchCustomers();
          }}
        />
      </Modal>
    </div>
  );
}

function CustomerForm({ customer, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: customer?.customer_name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = customer 
        ? `/api/customers/${customer.customer_id}` 
        : '/api/customers';
      
      const method = customer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert(customer ? 'Customer updated!' : 'Customer added!');
        onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Customer Name"
        value={formData.customer_name}
        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
        required
      />
      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({...formData, address: e.target.value})}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
      </Button>
    </form>
  );
}