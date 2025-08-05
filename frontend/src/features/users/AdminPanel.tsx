// frontend/src/features/users/AdminPanel.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import UserList from './components/UserList';
import UserCreateForm from './components/UserCreateForm';

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
}

const AdminPanel: React.FC = () => {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]); // ✅ Правильный тип
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Проверка прав доступа
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
        <p>У вас нет прав администратора.</p>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Ошибка загрузки пользователей:', response.status);
      }
    } catch (error) {
      console.error('Ошибка запроса пользователей:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateForm(false);
    fetchUsers(); // Обновляем список пользователей
  };

  const handleUserDeleted = () => {
    fetchUsers(); // Обновляем список пользователей
  };

  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка админ-панели...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-red-900">
              🔧 Панель администратора
            </h1>
            <p className="text-red-700 mt-1">
              Добро пожаловать, {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Управление пользователями</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showCreateForm ? 'Отменить' : '+ Создать пользователя'}
          </button>
        </div>

        {/* Форма создания пользователя */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <UserCreateForm onUserCreated={handleUserCreated} />
          </div>
        )}

        {/* Список пользователей */}
        <UserList 
          users={users} 
          onUserDeleted={handleUserDeleted}
        />
      </div>

      {/* Дополнительные админ-функции */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📊 Статистика</h3>
          <p className="text-gray-600 mb-4">Общая статистика системы</p>
          <div className="text-2xl font-bold text-blue-600">
            {users.length} пользователей
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">⚙️ Настройки</h3>
          <p className="text-gray-600 mb-4">Системные настройки</p>
          <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Открыть настройки
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📝 Логи</h3>
          <p className="text-gray-600 mb-4">Системные логи и аудит</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Просмотреть логи
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
