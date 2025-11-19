// Utility functions
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculateTotal(items, discount = 0, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);
  
  const discountAmount = discount;
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount;
  
  return {
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    total
  };
}

export function generateBillNumber(lastNumber = 0) {
  const nextNumber = lastNumber + 1;
  return `INV-${String(nextNumber).padStart(6, '0')}`;
}