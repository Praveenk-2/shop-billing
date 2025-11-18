# Shop Billing System

A complete, production-ready billing software for retail shops built with Next.js and MySQL.

## Features

✅ **User Authentication**
- Secure login/logout with JWT
- Role-based access (Admin/Cashier)

✅ **Billing**
- Real-time product search
- Cart management
- Multiple payment methods
- Discount & tax calculation
- Print bills

✅ **Product Management**
- Add/Edit/Delete products
- Category management
- Stock tracking
- Low stock alerts
- Barcode support

✅ **Customer Management**
- Customer database
- Purchase history
- Loyalty points tracking

✅ **Inventory Management**
- Stock movements tracking
- Stock adjustments
- Low stock alerts

✅ **Reports & Analytics**
- Sales reports (daily/monthly/yearly)
- Dashboard with key metrics
- Export capabilities

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0+
- **Authentication**: JWT, bcryptjs

## Installation

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed
- MySQL Workbench (optional)

### Step 1: Clone or Create Project
```bash
npx create-next-app@latest shop-billing
cd shop-billing
```

### Step 2: Install Dependencies
```bash
npm install mysql2 bcryptjs jsonwebtoken js-cookie recharts lucide-react
```

### Step 3: Database Setup
1. Open MySQL Workbench
2. Create a new connection (localhost)
3. Run the SQL script from Step 2 of this guide
4. Database `shop_billing_db` will be created with sample data

### Step 4: Environment Configuration
Create `.env.local` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shop_billing_db
JWT_SECRET=your_super_secret_jwt_key
NEXT_PUBLIC_APP_NAME=Shop Billing System
NEXT_PUBLIC_TAX_RATE=18
```

### Step 5: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

**Username**: `admin`  
**Password**: `admin123`

## Project Structure
```
shop-billing/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── billing/          # Billing page
│   │   ├── customers/        # Customer management
│   │   ├── dashboard/        # Dashboard
│   │   ├── inventory/        # Inventory management
│   │   ├── products/         # Product management
│   │   ├── reports/          # Reports
│   │   ├── settings/         # Settings
│   │   └── layout.jsx        # Dashboard layout
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication
│   │   ├── bills/           # Bills management
│   │   ├── categories/      # Categories
│   │   ├── customers/       # Customers
│   │   ├── dashboard/       # Dashboard stats
│   │   ├── products/        # Products
│   │   ├── reports/         # Reports
│   │   └── stock/           # Stock movements
│   ├── login/               # Login page
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   ├── layout/              # Layout components
│   └── ui/                  # Reusable UI components
├── context/
│   └── AuthContext.jsx      # Authentication context
├── lib/
│   ├── auth.js             # Auth utilities
│   ├── constants.js        # App constants
│   ├── db.js              # Database connection
│   └── utils.js           # Helper functions
├── middleware.js           # Route protection
├── .env.local             # Environment variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Key Features Explained

### 1. Billing System
- **Dynamic Cart**: Add/remove products, adjust quantities
- **Real-time Calculations**: Automatic subtotal, discount, tax calculation
- **Stock Validation**: Prevents overselling
- **Multiple Payment Methods**: Cash, Card, UPI, Credit
- **Print Bills**: Professional bill printing

### 2. Inventory Management
- **Real-time Stock Updates**: Automatic stock deduction on sales
- **Stock Movements**: Track all stock changes
- **Low Stock Alerts**: Get notified when stock is low
- **Stock Adjustments**: Manual stock corrections with reasons

### 3. Reports
- **Sales Reports**: Filter by date range and grouping (daily/monthly/yearly)
- **Dashboard Analytics**: Real-time business metrics
- **Export Data**: CSV export capabilities

### 4. Security
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security
- **Route Protection**: Middleware-based access control
- **Role-based Access**: Admin and Cashier roles

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Create new bill
- `GET /api/bills/[id]` - Get single bill
- `DELETE /api/bills/[id]` - Delete bill
- `GET /api/bills/today` - Today's summary

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get single customer
- `PUT /api/customers/[id]` - Update customer

### Stock
- `GET /api/stock/movement` - Get stock movements
- `POST /api/stock/movement` - Create stock movement

### Reports
- `GET /api/reports/sales` - Get sales report
- `GET /api/dashboard/stats` - Get dashboard statistics

## Database Schema

### Main Tables
1. **users** - System users (admin/cashier)
2. **products** - Product catalog
3. **categories** - Product categories
4. **customers** - Customer database
5. **bills** - Invoice records
6. **bill_items** - Invoice line items
7. **stock_movements** - Stock history

## Best Practices Implemented

### 1. Database
- ✅ Connection pooling for performance
- ✅ Transactions for data integrity
- ✅ Indexes for faster queries
- ✅ Foreign key constraints

### 2. Security
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ HTTP-only cookies
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

### 3. Code Structure
- ✅ Modular components
- ✅ Reusable UI components
- ✅ Context API for state management
- ✅ Custom hooks
- ✅ Utility functions

### 4. Performance
- ✅ Database connection pooling
- ✅ Lazy loading
- ✅ Optimized queries
- ✅ Client-side caching

## Customization

### Change Tax Rate
Edit `.env.local`:
```env
NEXT_PUBLIC_TAX_RATE=18  # Change to your tax rate
```

### Add New User Roles
Modify `lib/constants.js`:
```javascript
export const USER_ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  MANAGER: 'manager'  // Add new role
};
```

### Customize Bill Design
Edit `app/billing/print/[id]/page.jsx` for bill layout customization.

### Add More Payment Methods
Modify database enum and update `lib/constants.js`:
```javascript
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'credit', label: 'Credit' },
  { value: 'wallet', label: 'Wallet' }  // Add new
];
```

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p
```

### Port Already in Use
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Production Deployment

### 1. Build for Production
```bash
npm run build
npm start
```

### 2. Environment Variables
Set all required environment variables on your hosting platform.

### 3. Database
- Use production MySQL server
- Enable SSL connections
- Regular backups
- Set up monitoring

### 4. Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Enable database backups

## Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Check database connectivity
4. Verify environment variables

## License

MIT License - Free to use for commercial and personal projects.

## Version History

**v1.0.0** (Current)
- Initial release
- Complete billing system
- Product management
- Inventory tracking
- Reports and analytics
- User authentication

## Contributing

This is a complete system ready for production use. Feel free to customize according to your business needs.

## Credits

Built with ❤️ using Next.js, React, and MySQL.