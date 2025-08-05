// frontend/src/app/MainPage.tsx
import React from 'react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  position?: string;
  department: {
    id: number;
    name: string;
  } | null;
}

interface MainPageProps {
  user?: User;
  onLogout?: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ user, onLogout }) => {
  console.log('MainPage получил пользователя:', user); // Для отладки

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">Библиотека регламентов</h1>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium">
                  {user.firstName} {user.lastName}
                </div>
                {user.department && (
                  <div className="text-sm text-gray-600">
                    {user.department.name}
                  </div>
                )}
                <div className="text-xs text-blue-600">
                  {user.role}
                </div>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Выйти
                </button>
              )}
            </div>
          ) : (
            <div>Добро пожаловать!</div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4">
        {user ? (
          <div>
            <h2 className="text-xl mb-4">
              Добро пожаловать, {user.firstName}!
            </h2>
            
            {/* Показываем админ-панель для администратора */}
            {user.role === 'admin' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-lg leading-6 font-medium text-red-900">
                      🔧 Панель администратора
                    </h3>
                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                          Управление пользователями
                        </button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                          Настройки системы
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Основной контент для всех пользователей */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    📋 Производственные планы
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Управление производственными планами
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <button className="text-sm text-indigo-600 hover:text-indigo-900">
                    Перейти →
                  </button>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    🔧 Технологические карты
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Просмотр и создание техкарт
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <button className="text-sm text-indigo-600 hover:text-indigo-900">
                    Перейти →
                  </button>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    📖 База знаний
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Документация и инструкции
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <button className="text-sm text-indigo-600 hover:text-indigo-900">
                    Перейти →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center">
              <h2 className="text-xl mb-4">Войдите в систему</h2>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
