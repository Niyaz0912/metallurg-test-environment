import React, { useEffect, useState } from 'react';

type Props = {
  token: string;
};

type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
};

const AdminPanel: React.FC<Props> = ({ token }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch('http://127.0.0.1:3001/api/users', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Ошибка получения пользователей');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else if (Array.isArray(data)) {
          setUsers(data);
        } else {
          throw new Error('Некорректный формат данных');
        }
      })
      .catch(err => {
        console.error('Admin panel error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = (userId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить пользователя?')) return;

    fetch(`http://127.0.0.1:3001/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ошибка при удалении пользователя');
      }
      fetchUsers();
    })
    .catch(err => {
      console.error('Ошибка удаления пользователя:', err);
      alert('Не удалось удалить пользователя: ' + err.message);
    });
  };

  if (loading) {
    return <div className="p-6">Загрузка данных...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Админ-панель</h2>
        <div className="text-red-600 bg-red-50 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Админ-панель</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="border p-2 text-left">Логин</th>
              <th className="border p-2 text-left">Имя</th>
              <th className="border p-2 text-left">Фамилия</th>
              <th className="border p-2 text-left">Телефон</th>
              <th className="border p-2 text-left">Роль</th>
              <th className="border p-2 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border p-2">{u.username}</td>
                  <td className="border p-2">{u.firstName}</td>
                  <td className="border p-2">{u.lastName}</td>
                  <td className="border p-2">{u.phone}</td>
                  <td className="border p-2 capitalize">{u.role}</td>
                  <td className="border p-2">
                    <button className="text-blue-500 hover:underline mr-2">
                      Изменить
                    </button>
                    <button 
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(u.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border p-4 text-center text-gray-500">
                  Нет пользователей для отображения
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
