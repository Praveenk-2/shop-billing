// Application constants
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'credit', label: 'Credit' }
];

export const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier'
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  UNPAID: 'unpaid'
};

export const STOCK_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  ADJUSTMENT: 'adjustment'
};

export const TAX_RATE = parseFloat(process.env.NEXT_PUBLIC_TAX_RATE) / 100 || 0.18;