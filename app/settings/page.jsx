'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';

export default function SettingsPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    { header: 'Category Name', accessor: 'category_name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Created', accessor: 'created_at', render: (row) => new Date(row.created_at).toLocaleDateString() }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Card title="Categories" className="mb-6">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowModal(true)}>
            Add Category
          </Button>
        </div>
        <Table columns={columns} data={categories} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Category"
      >
        <CategoryForm
          onSuccess={() => {
            setShowModal(false);
            fetchCategories();
          }}
        />
      </Modal>
    </div>
  );
}

function CategoryForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert('Category added successfully!');
        onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Category Name"
        value={formData.category_name}
        onChange={(e) => setFormData({...formData, category_name: e.target.value})}
        required
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adding...' : 'Add Category'}
      </Button>
    </form>
  );
}