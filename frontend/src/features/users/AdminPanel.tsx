import React, { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
};

const AdminPanel = ({ token }: { token: string }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
  setError('');  // очистка предыдущей ошибки

  try {
    console.log("Fetching users with token:", token);
    const res = await fetch('http://localhost:3001/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(res.status === 401 ? 'Невалидный токен' : 'Ошибка сервера');
    }

    const data = await res.json();
    setUsers(Array.isArray(data) ? data : data.users || []);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
  }
};


  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Админ-панель</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">Логин</th>
              <th className="border p-2">Имя</th>
              <th className="border p-2">Фамилия</th>
              <th className="border p-2">Роль</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.firstName}</td>
                <td className="border p-2">{user.lastName}</td>
                <td className="border p-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;