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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // ✅ НОВОЕ: Функция удаления всех активных заданий
  const handleDeleteAllActiveAssignments = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments/delete-all-active', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении заданий');
      }

      const result = await response.json();
      alert(`Успешно удалено ${result.deletedCount} активных заданий`);
      
      setRefreshTrigger(prev => prev + 1); // Обновляем список
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Ошибка удаления заданий:', error);
      alert('Ошибка при удалении заданий');
    } finally {
      setIsDeleting(false);
    }
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

              {/* ✅ НОВОЕ: Кнопка удаления всех активных заданий */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? '⏳ Удаление...' : '🗑️ Удалить все активные'}
              </button>
            </div>
          )}
        </div>

        {/* ✅ НОВОЕ: Модальное окно подтверждения удаления */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-red-600 mb-4">
                ⚠️ Подтверждение удаления
              </h3>
              <p className="text-gray-700 mb-6">
                Вы действительно хотите удалить <strong>все активные задания</strong>? 
                <br />
                <br />
                <span className="text-red-600 font-medium">
                  Это действие нельзя отменить!
                </span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  disabled={isDeleting}
                >
                  Отменить
                </button>
                <button
                  onClick={handleDeleteAllActiveAssignments}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Удаление...' : 'Удалить все'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="text-red-600">🗑️ Удаление всех активных заданий</div>
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
            <div>• Активные задания можно удалить все сразу</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
