'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Cards';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { formatCurrency, calculateTotal } from '@/lib/utils';
import { TAX_RATE } from '@/lib/constants';

export default function BillingPage() {
  // const { user } = useAuth();
  // Mock user for no-auth mode
const user = { user_id: 1, username: 'guest', full_name: 'Guest User', role: 'cashier' };
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, [search, selectedCategory]);

  const fetchProducts = async () => {
    try {
      let url = '/api/products?';
      if (search) url += `search=${search}&`;
      if (selectedCategory) url += `category=${selectedCategory}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
      setAlert({ type: 'error', message: 'Product out of stock!' });
      return;
    }

    const existing = cart.find(item => item.product_id === product.product_id);
    
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        setAlert({ type: 'error', message: 'Not enough stock!' });
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.product_id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1, 
        unit_price: product.price,
        discount: 0 
      }]);
    }
  };

  const updateQuantity = (product_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(product_id);
      return;
    }

    const product = products.find(p => p.product_id === product_id);
    if (product && quantity > product.stock_quantity) {
      setAlert({ type: 'error', message: 'Not enough stock!' });
      return;
    }

    setCart(cart.map(item => 
      item.product_id === product_id ? { ...item, quantity } : item
    ));
  };

  const updateItemDiscount = (product_id, itemDiscount) => {
    setCart(cart.map(item => 
      item.product_id === product_id ? { ...item, discount: parseFloat(itemDiscount) || 0 } : item
    ));
  };

  const removeFromCart = (product_id) => {
    setCart(cart.filter(item => item.product_id !== product_id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSelectedCustomer(null);
  };

  const totals = calculateTotal(cart, discount, TAX_RATE);

  const handleCheckout = async () => {
  if (cart.length === 0) {
    setAlert({ type: 'error', message: 'Cart is empty!' });
    return;
  }

  setLoading(true);

  try {
    // Prepare bill data
    const billData = {
      customer_id: selectedCustomer?.customer_id || null,
      user_id: 1, // Default user ID
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        tax: ((item.quantity * item.unit_price - (item.discount || 0)) * TAX_RATE) || 0
      })),
      discount: discount || 0,
      tax: totals.tax || 0,
      payment_method: paymentMethod || 'cash',
      payment_status: 'paid',
      amount_paid: totals.total || 0,
      notes: null
    };

    console.log('Sending bill data:', billData); // Debug log

    const res = await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData)
    });

    console.log('Response status:', res.status); // Debug log

    const data = await res.json();
    console.log('Response data:', data); // Debug log

    if (data.success) {
      setAlert({ type: 'success', message: `Bill ${data.data.bill_number} created successfully!` });
      
      // Clear cart
      clearCart();
      
      // Wait a bit before showing print dialog
      setTimeout(() => {
        if (confirm('Bill created! Do you want to print it?')) {
          window.open(`/billing/print/${data.data.bill_id}`, '_blank');
        }
      }, 500);
    } else {
      setAlert({ type: 'error', message: data.message || 'Failed to create bill' });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    setAlert({ type: 'error', message: 'Network error: Failed to create bill' });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Billing</h1>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card title="Products">
            {/* Search and Filter */}
            <div className="mb-4 flex gap-2">
              <Input
                type="text"
                placeholder="Search products by name or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div
                  key={product.product_id}
                  onClick={() => addToCart(product)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                    product.stock_quantity <= 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-blue-500'
                  }`}
                >
                  <h3 className="font-semibold text-sm mb-1">{product.product_name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{product.category_name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.stock_quantity > product.reorder_level
                        ? 'bg-green-100 text-green-800'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            )}
          </Card>
        </div>

        {/* Cart Section */}
        <div>
          <Card title="Cart">
            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer (Optional)
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCustomer?.customer_id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.customer_id === parseInt(e.target.value));
                    setSelectedCustomer(customer);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.customer_name} - {customer.phone}
                    </option>
                  ))}
                </select>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCustomerModal(true)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product_id} className="border rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product_name}</h4>
                      <p className="text-xs text-gray-600">{formatCurrency(item.unit_price)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center border rounded px-2 py-1"
                      min="1"
                    />
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span>Disc:</span>
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateItemDiscount(item.product_id, e.target.value)}
                      className="w-20 border rounded px-2 py-1 text-sm"
                      placeholder="0"
                      min="0"
                    />
                    <span className="ml-auto font-semibold">
                      {formatCurrency((item.quantity * item.unit_price) - item.discount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Cart is empty. Add products to continue.
              </div>
            )}

            {/* Totals */}
            {cart.length > 0 && (
              <>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Overall Discount:</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-24 border rounded px-2 py-1 text-right"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Tax ({(TAX_RATE * 100).toFixed(0)}%):</span>
                    <span>{formatCurrency(totals.tax)}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatCurrency(totals.total)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : `Checkout - ${formatCurrency(totals.total)}`}
                  </Button>
                  <Button
                    onClick={clearCart}
                    variant="danger"
                    className="w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Add New Customer"
      >
        <AddCustomerForm
          onSuccess={() => {
            setShowCustomerModal(false);
            fetchCustomers();
          }}
        />
      </Modal>
    </div>
  );
}

// Add Customer Form Component
function AddCustomerForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert('Customer added successfully!');
        onSuccess();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to add customer');
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
        {loading ? 'Adding...' : 'Add Customer'}
      </Button>
    </form>
  );
}