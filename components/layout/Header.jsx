'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
    const menuItems = [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/billing', label: 'Billing', icon: '🧾' },
      { href: '/products', label: 'Products', icon: '📦' },
      { href: '/customers', label: 'Customers', icon: '👥' },
      { href: '/inventory', label: 'Inventory', icon: '📋' },
      { href: '/reports', label: 'Reports', icon: '📈' },
      { href: '/settings', label: 'Settings', icon: '⚙️' }
    ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.full_name}
          </h2>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className=''>
          <ul className="space-y-2 flex gap-1">
            {menuItems.map((item) => (
              <li key={item.href} className='text-[14px]'>
                <Link
                  href={item.href}
                  className={`flex items-center text-black px-3 py-2 gap-1 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-400 hover:text-white'
                  }`}
                >
                  <span className="text-[15px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}