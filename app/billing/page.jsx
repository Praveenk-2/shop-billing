'use client';

import { useState, useEffect, useRef } from 'react';

export default function BillingPage() {
  const [billItems, setBillItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [currentProductName, setCurrentProductName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const barcodeInputRef = useRef(null);
  const productNameInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Generate bill number and date
    setBillNumber(`BILL-${Date.now()}`);
    setBillDate(new Date().toLocaleDateString('en-IN'));
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search products with suggestions
  const searchProducts = async (searchTerm, searchType) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      let url = '/api/products?';
      if (searchType === 'barcode') {
        url += `search=${searchTerm}`; // Your API searches both name and barcode
      } else {
        url += `search=${searchTerm}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.data.length > 0) {
        setSuggestions(data.data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  // Handle barcode input change
  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setCurrentBarcode(value);
    searchProducts(value, 'barcode');
  };

  // Handle product name input change
  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setCurrentProductName(value);
    searchProducts(value, 'name');
  };

  // Select product from suggestions
  const selectProduct = (product) => {
    addProductToBill(product);
    setCurrentBarcode('');
    setCurrentProductName('');
    setSuggestions([]);
    setShowSuggestions(false);
    barcodeInputRef.current?.focus();
  };

  // Search by exact barcode on Enter
  const handleBarcodeKeyPress = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (!currentBarcode.trim()) return;
      
      // If there's exactly one suggestion, use it
      if (suggestions.length === 1) {
        selectProduct(suggestions[0]);
        return;
      }
      
      // Otherwise, do exact barcode search
      try {
        const res = await fetch(`/api/products?search=${currentBarcode}`);
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
          // Find exact barcode match
          const exactMatch = data.data.find(p => p.barcode === currentBarcode);
          if (exactMatch) {
            selectProduct(exactMatch);
          } else {
            selectProduct(data.data[0]);
          }
        } else {
          alert('Product not found!');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Search by product name on Enter
  const handleProductNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (suggestions.length === 1) {
        selectProduct(suggestions[0]);
      } else if (suggestions.length > 1) {
        // Show suggestions dropdown for user to select
        setShowSuggestions(true);
      } else {
        alert('Product not found!');
      }
    }
  };

  // Add product to bill
  const addProductToBill = (product) => {
    // Check stock
    if (product.stock_quantity <= 0) {
      alert('Product out of stock!');
      return;
    }

    // Check if product already exists in bill
    const existingIndex = billItems.findIndex(
      item => item.product_id === product.product_id
    );

    if (existingIndex >= 0) {
      // Update quantity
      const newItems = [...billItems];
      const newQty = newItems[existingIndex].quantity + 1;
      
      // Check stock limit
      if (newQty > product.stock_quantity) {
        alert('Not enough stock!');
        return;
      }
      
      newItems[existingIndex].quantity = newQty;
      newItems[existingIndex].amount = 
        newQty * parseFloat(newItems[existingIndex].unit_price || 0);
      setBillItems(newItems);
    } else {
      // Add new item
      const newItem = {
        product_id: product.product_id,
        barcode: product.barcode || product.product_code || 'N/A',
        product_name: product.product_name || 'Unknown Product',
        quantity: 1,
        unit_price: parseFloat(product.price) || 0,
        amount: parseFloat(product.price) || 0,
        discount: 0,
        tax_rate: 18, // Default GST rate
        stock_available: parseInt(product.stock_quantity) || 0
      };
      setBillItems([...billItems, newItem]);
    }
  };

  // Update item quantity
  const updateQuantity = (index, newQuantity) => {
    const qty = parseInt(newQuantity) || 0;
    
    // if (qty <= 0) {
    //   removeItem(index);
    //   return;
    // }

    const newItems = [...billItems];
    
    // Check stock
    if (qty > newItems[index].stock_available) {
      alert('Not enough stock! Available: ' + newItems[index].stock_available);
      return;
    }
    
    newItems[index].quantity = qty;
    newItems[index].amount = qty * parseFloat(newItems[index].unit_price || 0);
    setBillItems(newItems);
  };

  // Update item discount
  const updateDiscount = (index, newDiscount) => {
    const newItems = [...billItems];
    newItems[index].discount = parseFloat(newDiscount) || 0;
    setBillItems(newItems);
  };

  // Remove item
  const removeItem = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  // Calculate totals
  const calculateTotals = () => {
    let grossAmount = 0;
    let totalDiscount = 0;
    let taxAmount = 0;

    billItems.forEach(item => {
      const itemTotal = item.quantity * item.unit_price;
      grossAmount += itemTotal;
      totalDiscount += item.discount;
      const taxableAmount = itemTotal - item.discount;
      taxAmount += (taxableAmount * item.tax_rate) / 100;
    });

    const netAmount = grossAmount - totalDiscount + taxAmount;

    return {
      grossAmount: grossAmount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      netAmount: netAmount.toFixed(2)
    };
  };

  const totals = calculateTotals();

  // Checkout and save bill to database
  const handleCheckout = async () => {
    if (billItems.length === 0) {
      alert('Cart is empty! Please add items to the bill.');
      return;
    }

    setCheckoutLoading(true);

    try {
      // Calculate subtotal (before tax and discount)
      const subtotal = billItems.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );

      // Prepare bill data according to your database schema
      const billData = {
        bill_number: billNumber,
        customer_id: null, // You can add customer selection later
        user_id: 1, // Default user, you can get from auth context
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: parseFloat(totals.totalDiscount),
        tax: parseFloat(totals.taxAmount),
        total_amount: parseFloat(totals.netAmount),
        payment_method: 'cash', // You can add payment method selection
        payment_status: 'paid',
        amount_paid: parseFloat(totals.netAmount),
        notes: null,
        items: billItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          tax: ((item.quantity * item.unit_price - item.discount) * item.tax_rate) / 100,
          total_price: item.amount + (((item.quantity * item.unit_price - item.discount) * item.tax_rate) / 100)
        }))
      };

      console.log('Sending bill data:', billData);

      // Send to API
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (data.success) {
        alert(`✅ Bill ${billNumber} saved successfully!\n\nBill ID: ${data.data.bill_id}\nTotal: ₹${totals.netAmount}\n\nThe bill has been stored in the database.`);
        
        // Clear the bill
        setBillItems([]);
        setBillNumber(`BILL-${Date.now()}`);
        
        // Focus back to barcode input
        barcodeInputRef.current?.focus();
      } else {
        alert(`Failed to create bill: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Network error: Failed to create bill. Please check your connection.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-[15%] bg-blue-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing System</h1>
        <div className="text-right">
          <p className="text-sm">Bill No: {billNumber}</p>
          <p className="text-sm">Date: {billDate}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[85%]">
        {/* Left Side - Bill Items */}
        <div className="w-[75%] border-r border-gray-300 bg-white overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="border-b-2 border-gray-400 text-center flex items-center bg-gray-100">
            <span className="w-[8%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">S.No</span>
            <span className="w-[12%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">Code</span>
            <span className="w-[30%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">Product Name</span>
            <span className="w-[10%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">Qty</span>
            <span className="w-[12%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">Price</span>
            <span className="w-[12%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">Amount</span>
            <span className="w-[8%] border-r border-gray-300 py-2.5 px-2 font-semibold text-sm">Disc</span>
            <span className="w-[8%] py-2.5 px-2 font-semibold text-sm">Tax%</span>
          </div>

          {/* Bill Items */}
          <div className="flex-1 overflow-y-auto">
            {billItems.map((item, index) => (
              <div key={index} className="input-tab border-b border-gray-200 text-center flex items-stretch min-h-[40px] hover:bg-gray-50 relative">
                <span className="w-[8%] border-r border-gray-300 py-2 flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span className="w-[12%] border-r border-gray-300 py-2 flex items-center justify-center text-sm">
                  {item.barcode}
                </span>
                <span className="w-[30%] border-r border-gray-300 py-2 px-2 flex items-center text-left text-sm">
                  {item.product_name}
                </span>
                <span className="w-[10%] border-r border-gray-300 py-1">
                  <input
                    type="number"
                    className="w-full h-full text-center p-1 border-0 outline-none text-sm"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, e.target.value)}
                    min="1"
                  />
                </span>
                <span className="w-[12%] border-r border-gray-300 py-2 flex items-center justify-center text-sm">
                  ₹{Number(item.unit_price || 0).toFixed(2)}
                </span>
                <span className="w-[12%] border-r border-gray-300 py-2 flex items-center justify-center text-sm font-semibold">
                  ₹{Number(item.amount || 0).toFixed(2)}
                </span>
                <span className="w-[8%] border-r border-gray-300 py-1">
                  <input
                    type="number"
                    className="w-full h-full text-center p-1 border-0 outline-none text-sm"
                    value={item.discount}
                    onChange={(e) => updateDiscount(index, e.target.value)}
                    min="0"
                  />
                </span>
                <span className="w-[8%] py-2 flex items-center justify-center text-sm">
                  {item.tax_rate}%
                </span>
                <span className="absolute right-2 top-2 text-[#a30000] cursor-pointer input-X" onClick={() => removeItem(index)}>&times;</span>
              </div>
            ))}

            {/* Search Row at the end */}
            <div className="relative border-b border-gray-300 text-center flex items-stretch min-h-[40px] bg-yellow-50">
              <span className="w-[8%] border-r border-gray-300 py-1 flex items-center justify-center">
                {billItems.length + 1}
              </span>
              <span className="w-[12%] border-r border-gray-300 py-1 relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  className="w-full h-full text-center p-1 border-0 outline-none bg-transparent"
                  placeholder="Scan/Enter"
                  value={currentBarcode}
                  onChange={handleBarcodeChange}
                  onKeyPress={handleBarcodeKeyPress}
                  autoFocus
                />
              </span>
              <span className="w-[30%] border-r border-gray-300 py-1 relative">
                <input
                  ref={productNameInputRef}
                  type="text"
                  className="w-full h-full text-center p-1 border-0 outline-none bg-transparent"
                  placeholder="Search Product"
                  value={currentProductName}
                  onChange={handleProductNameChange}
                  onKeyPress={handleProductNameKeyPress}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 shadow-lg z-50"
                  >
                    {suggestions.map((product) => (
                      <div
                        key={product.product_id}
                        className="p-2 hover:bg-blue-100 cursor-pointer border-b border-gray-200 text-left"
                        onClick={() => selectProduct(product)}
                      >
                        <div className="font-semibold text-sm">{product.product_name}</div>
                        <div className="text-xs text-gray-600">
                          Code: {product.barcode} | Price: ₹{product.price} | Stock: {product.stock_quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </span>
              <span className="w-[10%] border-r border-gray-300 py-1"></span>
              <span className="w-[12%] border-r border-gray-300 py-1"></span>
              <span className="w-[12%] border-r border-gray-300 py-1"></span>
              <span className="w-[8%] border-r border-gray-300 py-1"></span>
              <span className="w-[8%] py-1"></span>
            </div>
          </div>
        </div>

        {/* Right Side - Summary */}
        <div className="w-[25%] bg-white flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Bill No</span>
              <span className="text-xs p-2 w-[50%]">{billNumber}</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Bill Date</span>
              <span className="text-xs p-2 w-[50%]">{billDate}</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Gross Amount</span>
              <span className="text-xs p-2 w-[50%] font-semibold">₹{totals.grossAmount}</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Item Discount</span>
              <span className="text-xs p-2 w-[50%]">₹{totals.totalDiscount}</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Tax Amount</span>
              <span className="text-xs p-2 w-[50%]">₹{totals.taxAmount}</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Surcharge</span>
              <span className="text-xs p-2 w-[50%]">₹0.00</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Coupon Amount</span>
              <span className="text-xs p-2 w-[50%]">₹0.00</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Package Charge</span>
              <span className="text-xs p-2 w-[50%]">₹0.00</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Other Charge</span>
              <span className="text-xs p-2 w-[50%]">₹0.00</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Extra Charge</span>
              <span className="text-xs p-2 w-[50%]">₹0.00</span>
            </div>

            <div className="flex w-full border-b border-gray-300">
              <span className="border-r border-gray-300 text-xs p-2 w-[50%] bg-gray-100 font-semibold">Roundoff Amount</span>
              <span className="text-xs p-2 w-[50%]">₹0.00</span>
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t-2 border-gray-400 p-4 bg-green-50">
            <h2 className="text-3xl font-bold text-green-700">Total: ₹{totals.netAmount}</h2>
            <button 
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={checkoutLoading || billItems.length === 0}
            >
              {checkoutLoading ? 'Processing...' : 'Checkout & Save'}
            </button>
            <button 
              className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              onClick={() => {
                if (confirm('Are you sure you want to clear the bill?')) {
                  setBillItems([]);
                }
              }}
            >
              Clear Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}