// frontend/src/features/assignments/AssignmentsPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import AssignmentList from './components/AssignmentList';
import AssignmentForm from './components/AssignmentForm';
import ExcelUploader from './components/ExcelUploader';

const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  
  // ✅ ИСПРАВЛЕНИЕ: Добавляем все недостающие состояния
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showExcelUploader, setShowExcelUploader] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ✅ ИСПРАВЛЕНИЕ: Определяем возможности пользователя
  const canCreateAssignments = user?.role === 'master' || user?.role === 'admin';
  const canViewAllAssignments = user?.role === 'master' || user?.role === 'admin';

  const handleAssignmentCreated = () => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1); // Обновляем список
  };

  const handleExcelUploadComplete = () => {
    setShowExcelUploader(false);
    setRefreshTrigger(prev => prev + 1); // Обновляем список
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <h1 className="text-2xl font-bold text-blue-900">
          📋 Сменные задания
        </h1>
        <p className="text-blue-700 mt-1">
          {canViewAllAssignments 
            ? `Управление заданиями для всех операторов (${user?.role})` 
            : `Ваши персональные задания, ${user?.firstName}`}
        </p>
      </div>

      {/* Основной контент */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {canViewAllAssignments ? 'Все задания' : 'Мои задания'}
          </h2>
          
          {/* Кнопки действий */}
          {canCreateAssignments && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setShowExcelUploader(false); // Закрываем Excel загрузчик
                }}
                className={`px-4 py-2 rounded font-medium ${
                  showCreateForm
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {showCreateForm ? 'Отменить' : '+ Создать задание'}
              </button>
              
              <button
                onClick={() => {
                  setShowExcelUploader(!showExcelUploader);
                  setShowCreateForm(false); // Закрываем форму создания
                }}
                className={`px-4 py-2 rounded font-medium ${
                  showExcelUploader
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showExcelUploader ? 'Отменить' : '📊 Загрузить Excel'}
              </button>
            </div>
          )}
        </div>

        {/* Форма создания задания */}
        {showCreateForm && canCreateAssignments && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <AssignmentForm onAssignmentCreated={handleAssignmentCreated} />
          </div>
        )}

        {/* Excel загрузчик */}
        {showExcelUploader && canCreateAssignments && (
          <div className="mb-6">
            <ExcelUploader onUploadComplete={handleExcelUploadComplete} />
          </div>
        )}

        {/* Список заданий */}
        <AssignmentList 
          key={refreshTrigger} 
          userRole={user?.role || 'employee'}
        />
      </div>

      {/* Информационные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📊 Функции</h3>
          <p className="text-gray-600 mb-4">Доступные действия</p>
          <div className="space-y-2 text-sm">
            {canCreateAssignments ? (
              <>
                <div className="text-green-600">✅ Создание заданий</div>
                <div className="text-green-600">✅ Массовая загрузка Excel</div>
                <div className="text-green-600">✅ Управление всеми заданиями</div>
              </>
            ) : (
              <>
                <div className="text-blue-600">👁️ Просмотр своих заданий</div>
                <div className="text-blue-600">✏️ Отметка выполнения</div>
                <div className="text-blue-600">📝 Ввод фактического количества</div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">👤 Профиль</h3>
          <p className="text-gray-600 mb-4">Информация о пользователе</p>
          <div className="space-y-1 text-sm">
            <div><strong>Имя:</strong> {user?.firstName} {user?.lastName}</div>
            <div><strong>Роль:</strong> {user?.role}</div>
            {user?.department && (
              <div><strong>Отдел:</strong> {user.department.name}</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">📋 Справка</h3>
          <p className="text-gray-600 mb-4">Как работать с заданиями</p>
          <div className="space-y-1 text-xs text-gray-600">
            <div>• Задания создаются мастерами</div>
            <div>• Операторы выполняют задания</div>
            <div>• Можно загружать Excel файлы</div>
            <div>• Отмечайте фактическое количество</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
