'use client';

import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Header() {
  // const { user, logout } = useAuth();

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