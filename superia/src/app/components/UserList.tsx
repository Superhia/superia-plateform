'use client';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  created_at: string;
}

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h2 className='text-2xl font-semibold py-5'>Users List</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} (créé le : {new Date(user.created_at).toLocaleString()})
            <button 
            className='px-2 m-1 rounded-md border-0 text-red-700 ring-1 ring-inset ring-red-300 text-xl 2xl:leading-8'
            onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
