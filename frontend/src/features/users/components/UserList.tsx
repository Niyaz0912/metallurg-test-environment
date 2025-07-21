import React, { useEffect, useState } from "react";

type UserListProps = { token: string };

export default function UserList({ token }: UserListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setUsers)
      .catch(() => setError("Ошибка загрузки пользователей"));
  }, [token]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!users.length) return <div>Нет пользователей</div>;

  return (
    <div className="p-4 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Пользователи</h2>
      <table className="w-full table-auto">
        <thead><tr>
          <th>Логин</th><th>ФИО</th><th>Роль</th>
        </tr></thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
