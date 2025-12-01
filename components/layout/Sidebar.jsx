'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/billing', label: 'Billing', icon: '🧾' },
    { href: '/products', label: 'Products', icon: '📦' },
    { href: '/customers', label: 'Customers', icon: '👥' },
    { href: '/inventory', label: 'Inventory', icon: '📋' },
    { href: '/reports', label: 'Reports', icon: '📈' },
  ];

  if (user?.role === 'admin') {
    menuItems.push(
      { href: '/settings', label: 'Settings', icon: '⚙️' },
      { href: '/settings/users', label: 'Users', icon: '👤' }
    );
  }

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-8">Shop Billing</h1>
        
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}