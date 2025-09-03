// frontend/src/features/users/AdminPanel.tsx
import React, { useState, useEffect } from 'react';

import { useAuth } from '../../auth/hooks/useAuth';
import ProductionPlansManager from '../../productionPlans/components/ProductionPlansManager';
import UserCreateForm from '../components/UserCreateForm';
import UserList from '../components/UserList';
// ✅ Правильный импорт из техкарт
import TechCardsManager from '../../techCard/components/TechCardsManager';

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
  const [users, setUsers] = useState<User[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeSection, setActiveSection] = useState<'users' | 'plans' | 'techcards'>('users');

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
    setShowCreateForm(false); // Close the form after creation
    fetchUsers(); // Refresh the user list
  };

  const handleUserDeleted = () => {
    fetchUsers(); // Refresh the user list
  };

  // Проверка прав доступа
  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
        <p>У вас нет прав администратора.</p>
      </div>
    );
  }

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

      {/* Навигация по секциям */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveSection('users')}
            className={`px-4 py-2 rounded ${
              activeSection === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👥 Пользователи
          </button>
          <button
            onClick={() => setActiveSection('plans')}
            className={`px-4 py-2 rounded ${
              activeSection === 'plans' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 Планы производства
          </button>
          <button
            onClick={() => setActiveSection('techcards')}
            className={`px-4 py-2 rounded ${
              activeSection === 'techcards' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📄 Техкарты
          </button>
        </div>

        {/* Содержимое секций */}
        {activeSection === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Управление пользователями</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showCreateForm ? 'Отменить' : '+ Создать пользователя'}
              </button>
            </div>

            {showCreateForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <UserCreateForm onUserCreated={handleUserCreated} />
              </div>
            )}

            <UserList 
              users={users} 
              onUserDeleted={handleUserDeleted}
            />
          </div>
        )}

        {activeSection === 'plans' && (
          <ProductionPlansManager />
        )}

        {activeSection === 'techcards' && (
          <TechCardsManager />
        )}
      </div>

      {/* Статистические карточки */}
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

