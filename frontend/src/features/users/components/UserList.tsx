// frontend/src/features/users/components/UserList.tsx
import React from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  phone?: string;
  department: {
    id: number;
    name: string;
  } | null;
  departmentId: number; // Add departmentId
}

interface UserListProps {
  users: User[];
  onUserDeleted: () => void;
  onEditUser: (user: User) => void; // Добавляем пропс для редактирования
}

const UserList: React.FC<UserListProps> = ({ users, onUserDeleted, onEditUser }) => {
  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onUserDeleted(); // Обновляем список пользователей
      } else {
        alert('Ошибка удаления пользователя');
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        onUserDeleted(); // Обновляем список пользователей
      } else {
        alert('Ошибка изменения роли');
      }
    } catch (error) {
      console.error('Ошибка изменения роли:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Пользователи не найдены
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Пользователь
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Логин
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Роль
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Департамент
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Телефон
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{user.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="employee">Сотрудник</option>
                  <option value="master">Мастер</option>
                  <option value="director">Директор</option>
                  <option value="admin">Администратор</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {user.department?.name || 'Не указан'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {user.phone || 'Не указан'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEditUser(user)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
