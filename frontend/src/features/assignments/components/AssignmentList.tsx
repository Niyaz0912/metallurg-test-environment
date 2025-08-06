// frontend/src/features/assignments/components/AssignmentList.tsx
import React, { useEffect, useState } from 'react';
import { fetchAssignments, updateAssignment, deleteAssignment, Assignment } from '../../../shared/api/assignmentsApi';
import { useAuth } from '../../auth/hooks/useAuth';

interface AssignmentListProps {
  userRole: string;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ userRole }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  
  const { user } = useAuth();
  
  const canManageAllAssignments = userRole === 'master' || userRole === 'admin';

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAssignments();
      setAssignments(response.data || []);
    } catch (err) {
      console.error('Ошибка загрузки заданий:', err);
      setError('Ошибка при загрузке заданий');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: 'assigned' | 'completed') => {
    if (updatingIds.has(id)) return;
    
    setUpdatingIds(prev => new Set(prev).add(id));
    
    try {
      await updateAssignment(id, { status: newStatus });
      
      // Обновляем локальное состояние
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === id 
            ? { ...assignment, status: newStatus }
            : assignment
        )
      );
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка при обновлении статуса задания');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleActualQuantityUpdate = async (id: number, actualQuantity: number) => {
    if (updatingIds.has(id)) return;
    
    setUpdatingIds(prev => new Set(prev).add(id));
    
    try {
      await updateAssignment(id, { actualQuantity });
      
      // Обновляем локальное состояние
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === id 
            ? { ...assignment, actualQuantity }
            : assignment
        )
      );
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      alert('Ошибка при обновлении количества');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageAllAssignments) return;
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return;
    
    try {
      await deleteAssignment(id);
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    } catch (error) {
      console.error('Ошибка удаления задания:', error);
      alert('Ошибка при удалении задания');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftTypeText = (shiftType: string) => {
    return shiftType === 'day' ? 'Дневная' : 'Ночная';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Загрузка заданий...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadAssignments}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <div className="text-xl mb-2">📋</div>
        <div>Задания не найдены</div>
        <p className="text-sm mt-2">
          {canManageAllAssignments 
            ? 'Создайте первое задание, нажав кнопку выше'
            : 'У вас пока нет назначенных заданий'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Найдено заданий: <span className="font-semibold">{assignments.length}</span>
      </div>

      {/* Десктопная версия - таблица */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Задача
                </th>
                {canManageAllAssignments && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Оператор
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Смена
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Машина
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Количество
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 mb-1">
                      {assignment.detailName || 'Не указано'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {assignment.taskDescription}
                    </div>
                    {assignment.customerName && (
                      <div className="text-xs text-blue-600 mt-1">
                        Заказчик: {assignment.customerName}
                      </div>
                    )}
                  </td>
                  
                  {canManageAllAssignments && (
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.operator 
                          ? `${assignment.operator.firstName} ${assignment.operator.lastName}`
                          : `ID: ${assignment.operatorId}`}
                      </div>
                    </td>
                  )}
                  
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(assignment.shiftDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getShiftTypeText(assignment.shiftType)}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="text-sm font-mono text-gray-900">
                      {assignment.machineNumber}
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      План: <span className="font-semibold">{assignment.plannedQuantity}</span>
                    </div>
                    {assignment.status === 'completed' && assignment.actualQuantity !== null ? (
                      <div className="text-sm text-green-600">
                        Факт: <span className="font-semibold">{assignment.actualQuantity}</span>
                      </div>
                    ) : user?.id === assignment.operatorId && (
                      <input
                        type="number"
                        min="0"
                        placeholder="Факт"
                        className="mt-1 w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                        onBlur={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 0) {
                            handleActualQuantityUpdate(assignment.id, value);
                          }
                        }}
                        disabled={updatingIds.has(assignment.id)}
                      />
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status === 'assigned' ? 'Назначено' : 'Выполнено'}
                    </span>
                  </td>
                  
                  <td className="px-4 py-4 text-sm">
                    <div className="space-x-2">
                      {user?.id === assignment.operatorId && assignment.status === 'assigned' && (
                        <button
                          onClick={() => handleStatusUpdate(assignment.id, 'completed')}
                          disabled={updatingIds.has(assignment.id)}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          {updatingIds.has(assignment.id) ? '...' : 'Выполнить'}
                        </button>
                      )}
                      
                      {canManageAllAssignments && (
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Мобильная версия - карточки */}
      <div className="lg:hidden space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-gray-900">
                {assignment.detailName || 'Задание'}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}>
                {assignment.status === 'assigned' ? 'Назначено' : 'Выполнено'}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              {assignment.taskDescription}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-500">Смена:</span> {formatDate(assignment.shiftDate)}
              </div>
              <div>
                <span className="text-gray-500">Тип:</span> {getShiftTypeText(assignment.shiftType)}
              </div>
              <div>
                <span className="text-gray-500">Машина:</span> {assignment.machineNumber}
              </div>
              <div>
                <span className="text-gray-500">План:</span> {assignment.plannedQuantity}
              </div>
            </div>

            {assignment.customerName && (
              <div className="text-xs text-blue-600 mb-2">
                Заказчик: {assignment.customerName}
              </div>
            )}
            
            {user?.id === assignment.operatorId && assignment.status === 'assigned' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusUpdate(assignment.id, 'completed')}
                  disabled={updatingIds.has(assignment.id)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {updatingIds.has(assignment.id) ? 'Обновление...' : 'Отметить выполненным'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;

