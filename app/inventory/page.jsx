'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import { useAuth } from '@/context/AuthContext';

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?lowStock=true');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await fetch('/api/stock/movement');
      const data = await res.json();
      if (data.success) {
        setMovements(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const productColumns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Current Stock', accessor: 'stock_quantity' },
    { header: 'Reorder Level', accessor: 'reorder_level' },
    { header: 'Status', accessor: 'status', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.stock_quantity <= 0 
          ? 'bg-red-100 text-red-800'
          : row.stock_quantity <= row.reorder_level
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-green-100 text-green-800'
      }`}>
        {row.stock_quantity <= 0 ? 'Out of Stock' : row.stock_quantity <= row.reorder_level ? 'Low Stock' : 'In Stock'}
      </span>
    )},
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <Button
        variant="outline"
        onClick={() => {
          setSelectedProduct(row);
          setShowModal(true);
        }}
        className="text-xs py-1"
      >
        Adjust Stock
      </Button>
    )}
  ];

  const movementColumns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Type', accessor: 'movement_type', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.movement_type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {row.movement_type.toUpperCase()}
      </span>
    )},
    { header: 'Quantity', accessor: 'quantity' },
    { header: 'Reference', accessor: 'reference_type' },
    { header: 'Created By', accessor: 'created_by_name' },
    { header: 'Date', accessor: 'created_at', render: (row) => new Date(row.created_at).toLocaleString() }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Low Stock Products</h3>
          <p className="text-4xl font-bold">{products.filter(p => p.stock_quantity <= p.reorder_level).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Out of Stock</h3>
          <p className="text-4xl font-bold">{products.filter(p => p.stock_quantity <= 0).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Products</h3>
          <p className="text-4xl font-bold">{products.length}</p>
        </Card>
      </div>

      <Card title="Stock Alerts" className="mb-6">
        <Table columns={productColumns} data={products} />
      </Card>

      <Card title="Recent Stock Movements">
        <Table columns={movementColumns} data={movements.slice(0, 20)} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        title="Adjust Stock"
      >
        <StockAdjustmentForm
          product={selectedProduct}
          userId={user?.user_id}
          onSuccess={() => {
            setShowModal(false);
            setSelectedProduct(null);
            fetchProducts();
            fetchMovements();
          }}
        />
      </Modal>
    </div>
  );
}

function StockAdjustmentForm({ product, userId, onSuccess }) {
  const [formData, setFormData] = useState({
    movement_type: 'in',
    quantity: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/stock/movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.product_id,
          ...formData,
          created_by: userId
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Stock adjusted successfully!');
        onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Product: <strong>{product?.product_name}</strong></p>
        <p className="text-sm text-gray-600">Current Stock: <strong>{product?.stock_quantity}</strong></p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Movement Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.movement_type}
          onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="in">Stock In (Add)</option>
          <option value="out">Stock Out (Remove)</option>
          <option value="adjustment">Adjustment</option>
        </select>
      </div>

      <Input
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
        required
        min="1"
      />

      <Input
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({...formData, notes: e.target.value})}
        placeholder="Reason for adjustment..."
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adjusting...' : 'Adjust Stock'}
      </Button>
    </form>
  );
}