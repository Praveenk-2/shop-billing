// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { useRouter } from 'next/navigation';
// import Card from '@/components/ui/Cards';
// import Table from '@/components/ui/Table';
// import Button from '@/components/ui/Button';

// export default function UsersPage() {
//   // const { user } = useAuth();
//   const router = useRouter();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Only admin can access this page
//     if (user && user.role !== 'admin') {
//       router.push('/dashboard');
//       return;
//     }
    
//     if (user) {
//       fetchUsers();
//     }
//   }, [user, router]);

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch('/api/users');
//       const data = await res.json();
//       if (data.success) {
//         setUsers(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleStatus = async (userId, currentStatus) => {
//     if (!confirm('Are you sure you want to change this user status?')) return;

//     try {
//       const res = await fetch(`/api/users/${userId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ is_active: !currentStatus })
//       });

//       const data = await res.json();

//       if (data.success) {
//         alert('User status updated');
//         fetchUsers();
//       }
//     } catch (error) {
//       alert('Failed to update user status');
//     }
//   };

//   const columns = [
//     { header: 'Username', accessor: 'username' },
//     { header: 'Full Name', accessor: 'full_name' },
//     { header: 'Email', accessor: 'email' },
//     { header: 'Role', accessor: 'role', render: (row) => (
//       <span className={`px-2 py-1 rounded text-xs ${
//         row.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
//       }`}>
//         {row.role.toUpperCase()}
//       </span>
//     )},
//     { header: 'Status', accessor: 'is_active', render: (row) => (
//       <span className={`px-2 py-1 rounded text-xs ${
//         row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//       }`}>
//         {row.is_active ? 'Active' : 'Inactive'}
//       </span>
//     )},
//     { header: 'Created', accessor: 'created_at', render: (row) => 
//       new Date(row.created_at).toLocaleDateString() 
//     },
//     { header: 'Actions', accessor: 'actions', render: (row) => (
//       <Button
//         variant={row.is_active ? 'danger' : 'success'}
//         onClick={() => handleToggleStatus(row.user_id, row.is_active)}
//         className="text-xs py-1"
//       >
//         {row.is_active ? 'Deactivate' : 'Activate'}
//       </Button>
//     )}
//   ];

//   if (user?.role !== 'admin') {
//     return null;
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">User Management</h1>
//         <Button onClick={() => router.push('/register')}>
//           Add New User
//         </Button>
//       </div>

//       <Card>
//         {loading ? (
//           <div className="text-center py-8">Loading users...</div>
//         ) : (
//           <Table columns={columns} data={users} />
//         )}
//       </Card>
//     </div>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Cards';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if (!confirm('Are you sure you want to change this user status?')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const data = await res.json();

      if (data.success) {
        alert('User status updated');
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const columns = [
    { header: 'Username', accessor: 'username' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Role', accessor: 'role', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {row.role.toUpperCase()}
      </span>
    )},
    { header: 'Status', accessor: 'is_active', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs ${
        row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {row.is_active ? 'Active' : 'Inactive'}
      </span>
    )},
    { header: 'Created', accessor: 'created_at', render: (row) => 
      new Date(row.created_at).toLocaleDateString() 
    },
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <Button
        variant={row.is_active ? 'danger' : 'success'}
        onClick={() => handleToggleStatus(row.user_id, row.is_active)}
        className="text-xs py-1"
      >
        {row.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )}
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <Table columns={columns} data={users} />
        )}
      </Card>
    </div>
  );
}