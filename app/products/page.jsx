'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const columns = [
    { header: 'Product Name', accessor: 'product_name' },
    { header: 'Category', accessor: 'category_name' },
    { header: 'Barcode', accessor: 'barcode' },
    { header: 'Price', accessor: 'price', render: (row) => formatCurrency(row.price) },
    { header: 'Stock', accessor: 'stock_quantity', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.stock_quantity > row.reorder_level
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {row.stock_quantity}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setEditProduct(row);
            setShowModal(true);
          }}
          className="text-xs py-1"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => handleDelete(row.product_id)}
          className="text-xs py-1"
        >
          Delete
        </Button>
      </div>
    )}
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => {
          setEditProduct(null);
          setShowModal(true);
        }}>
          Add Product
        </Button>
      </div>

      <Card>
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <Table columns={columns} data={products} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditProduct(null);
        }}
        title={editProduct ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          product={editProduct}
          categories={categories}
          onSuccess={() => {
            setShowModal(false);
            setEditProduct(null);
            fetchProducts();
          }}
        />
      </Modal>
    </div>
  );
}

function ProductForm({ product, categories, onSuccess }) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    category_id: product?.category_id || '',
    barcode: product?.barcode || '',
    price: product?.price || '',
    cost_price: product?.cost_price || '',
    stock_quantity: product?.stock_quantity || 0,
    reorder_level: product?.reorder_level || 10,
    unit: product?.unit || 'piece',
    description: product?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = product 
        ? `/api/products/${product.product_id}` 
        : '/api/products';
      
      const method = product ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert(product ? 'Product updated!' : 'Product added!');
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
        label="Product Name"
        value={formData.product_name}
        onChange={(e) => setFormData({...formData, product_name: e.target.value})}
        required
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category_id}
          onChange={(e) => setFormData({...formData, category_id: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Barcode"
        value={formData.barcode}
        onChange={(e) => setFormData({...formData, barcode: e.target.value})}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
        />
        <Input
          label="Cost Price"
          type="number"
          step="0.01"
          value={formData.cost_price}
          onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Quantity"
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
        />
        <Input
          label="Reorder Level"
          type="number"
          value={formData.reorder_level}
          onChange={(e) => setFormData({...formData, reorder_level: e.target.value})}
        />
      </div>

      <Input
        label="Unit"
        value={formData.unit}
        onChange={(e) => setFormData({...formData, unit: e.target.value})}
        placeholder="e.g., piece, kg, liter"
      />

      <Button type="submit" disabled={loading} className="w-full mt-4">
        {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
      </Button>
    </form>
  );
}