// frontend/src/features/techCard/components/TechCardViewer.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  fetchTechCardById, 
  addExecution, 
  type TechCard,
  type CreateExecutionData,
  getTechCardProgress,
  getPriorityColor,
  isTechCardOverdue,
  getDaysToDeadline,
  formatFileSize,
  getFileUrl // ← Импорт новой функции
} from '../../../shared/api/techCardsApi';

interface TechCardViewerProps {
  techCard: TechCard;
  onClose: () => void;
  onEdit?: () => void;
}

const TechCardViewer: React.FC<TechCardViewerProps> = ({ 
  techCard: initialTechCard, 
  onClose, 
  onEdit 
}) => {
  const { user } = useAuth();
  const [detailedCard, setDetailedCard] = useState<TechCard>(initialTechCard);
  const [loading, setLoading] = useState(false);
  const [showExecutionForm, setShowExecutionForm] = useState(false);
  
  const [executionForm, setExecutionForm] = useState({
    quantityProduced: '',
    setupNumber: 1
  });

  const canManage = user?.role === 'master' || user?.role === 'admin';
  const canAddExecution = ['master', 'admin', 'employee'].includes(user?.role || '');

  useEffect(() => {
    const loadDetailedCard = async () => {
      try {
        setLoading(true);
        const detailed = await fetchTechCardById(initialTechCard.id.toString());
        setDetailedCard(detailed);
      } catch (error) {
        console.error('Error loading detailed tech card:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailedCard();
  }, [initialTechCard.id]);

  const handleAddExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executionForm.quantityProduced || parseInt(executionForm.quantityProduced) < 1) {
      alert('Укажите корректное количество произведенных деталей');
      return;
    }

    try {
      const executionData: CreateExecutionData = {
        quantityProduced: parseInt(executionForm.quantityProduced),
        setupNumber: executionForm.setupNumber
      };

      await addExecution(detailedCard.id.toString(), executionData);

      const updated = await fetchTechCardById(detailedCard.id.toString());
      setDetailedCard(updated);
      
      setExecutionForm({
        quantityProduced: '',
        setupNumber: 1
      });
      setShowExecutionForm(false);
      
    } catch (error) {
      alert('Ошибка при добавлении выполнения');
      console.error('Error adding execution:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '📝 Черновик';
      case 'active': return '✅ Активная';
      case 'archived': return '📁 Архив';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    const priorities = {
      low: '🟢 Низкий',
      medium: '🟡 Средний', 
      high: '🟠 Высокий',
      urgent: '🔴 Срочный'
    };
    return priorities[priority as keyof typeof priorities] || priority;
  };

  const progressPercent = getTechCardProgress(detailedCard);
  const remainingQuantity = detailedCard.quantity - detailedCard.totalProducedQuantity;
  const isOverdue = isTechCardOverdue(detailedCard);
  const daysToDeadline = getDaysToDeadline(detailedCard);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{detailedCard.productName}</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(detailedCard.status)}`}>
              {getStatusText(detailedCard.status)}
            </span>
            <span 
              className="px-2 py-1 text-xs font-medium rounded"
              style={{ 
                backgroundColor: `${getPriorityColor(detailedCard.priority)}20`,
                color: getPriorityColor(detailedCard.priority),
                border: `1px solid ${getPriorityColor(detailedCard.priority)}40`
              }}
            >
              {getPriorityText(detailedCard.priority)}
            </span>
            {detailedCard.partNumber && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                🏷️ {detailedCard.partNumber}
              </span>
            )}
            {isOverdue && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded font-medium">
                ⚠️ Просрочено
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && canManage && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                ✏️ Редактировать
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className="text-gray-600">Загрузка данных...</span>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Левая колонка - информация о заказе */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-indigo-900 border-b border-indigo-100 pb-2">
                    📋 Информация о заказе
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-indigo-600">🏢 Заказчик:</label>
                        <p className="text-gray-900 font-medium">{detailedCard.customer}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-indigo-600">📋 Номер заказа:</label>
                        <p className="text-gray-900 font-medium">{detailedCard.order}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-indigo-600">🔧 Изделие:</label>
                        <p className="text-gray-900 font-medium">{detailedCard.productName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-indigo-600">📊 План выпуска:</label>
                        <p className="text-gray-900 font-medium">{detailedCard.quantity} шт</p>
                      </div>
                    </div>

                    {(detailedCard.plannedEndDate || detailedCard.actualEndDate) && (
                      <div className="pt-2 border-t border-indigo-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {detailedCard.plannedEndDate && (
                            <div>
                              <label className="text-sm font-medium text-indigo-600">📅 Плановая дата:</label>
                              <p className="text-gray-900">
                                {new Date(detailedCard.plannedEndDate).toLocaleDateString('ru-RU')}
                                {daysToDeadline !== null && !detailedCard.actualEndDate && (
                                  <span className={`ml-2 text-xs ${daysToDeadline < 0 ? 'text-red-600' : daysToDeadline < 3 ? 'text-orange-600' : 'text-green-600'}`}>
                                    ({daysToDeadline < 0 ? `просрочено на ${Math.abs(daysToDeadline)} дн.` : `${daysToDeadline} дн.`})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                          {detailedCard.actualEndDate && (
                            <div>
                              <label className="text-sm font-medium text-indigo-600">✅ Факт. дата:</label>
                              <p className="text-gray-900">{new Date(detailedCard.actualEndDate).toLocaleDateString('ru-RU')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {detailedCard.description && (
                      <div className="pt-2 border-t border-indigo-100">
                        <label className="text-sm font-medium text-indigo-600">📄 Описание:</label>
                        <p className="text-gray-900 mt-1">{detailedCard.description}</p>
                      </div>
                    )}

                    {detailedCard.notes && (
                      <div className="pt-2 border-t border-indigo-100">
                        <label className="text-sm font-medium text-indigo-600">📝 Заметки:</label>
                        <p className="text-gray-900 mt-1 whitespace-pre-line">{detailedCard.notes}</p>
                      </div>
                    )}

                    {detailedCard.creator && (
                      <div className="pt-2 border-t border-indigo-100">
                        <label className="text-sm font-medium text-indigo-600">👤 Создал:</label>
                        <p className="text-gray-900">
                          {detailedCard.creator.firstName} {detailedCard.creator.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(detailedCard.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Прогресс выполнения */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-900 border-b border-green-100 pb-2">
                    📊 Прогресс выполнения
                  </h3>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-green-700">Выполнено</span>
                      <span className="text-lg font-bold text-green-900">
                        {detailedCard.totalProducedQuantity} из {detailedCard.quantity} 
                        <span className="text-sm font-normal ml-2">({progressPercent}%)</span>
                      </span>
                    </div>
                    
                    <div className="w-full bg-green-200 rounded-full h-4 mb-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      >
                        {progressPercent > 10 && (
                          <span className="text-xs font-bold text-white">
                            {progressPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-600">{detailedCard.totalProducedQuantity}</p>
                        <p className="text-xs text-green-600">Произведено</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-orange-600">{remainingQuantity}</p>
                        <p className="text-xs text-orange-600">Остается</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Правая колонка - PDF файл */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-purple-900 border-b border-purple-100 pb-2">
                  📄 Техкарта и чертеж
                </h3>
                {detailedCard.pdfUrl ? (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 h-80 flex flex-col items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📄</div>
                      <p className="text-gray-700 mb-2">PDF файл с техкартой и чертежом</p>
                      {detailedCard.pdfFileSize && (
                        <p className="text-sm text-gray-500 mb-4">{formatFileSize(detailedCard.pdfFileSize)}</p>
                      )}
                      
                      {/* ✅ ОБНОВЛЕННАЯ КНОПКА С ЦЕНТРАЛИЗОВАННОЙ ФУНКЦИЕЙ */}
                      <button
                        onClick={() => {
                          if (!detailedCard.pdfUrl) {
                            console.error('PDF URL is not available');
                            return;
                          }
                          
                          const pdfUrl = getFileUrl(detailedCard.pdfUrl);
                          console.log('Opening PDF:', pdfUrl);
                          window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        <span>📖 Открыть PDF файл</span>
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                      <p className="text-xs text-gray-500 mt-2">Откроется в новой вкладке</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-6 h-80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl text-gray-400 mb-4">📄</div>
                      <p className="text-gray-500">PDF файл не загружен</p>
                      {canManage && (
                        <p className="text-sm text-gray-400 mt-2">
                          Используйте кнопку "Редактировать" для загрузки файла
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Фиксация работы */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-orange-900 border-b border-orange-100 pb-1">
                  ⚡ Фиксация работы
                </h3>
                {canAddExecution && detailedCard.status === 'active' && (
                  <button
                    onClick={() => setShowExecutionForm(!showExecutionForm)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    + Зафиксировать работу
                  </button>
                )}
              </div>

              {showExecutionForm && (
                <form onSubmit={handleAddExecution} className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 mb-6 border border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2">
                        📊 Количество произведено *
                      </label>
                      <input
                        type="number"
                        value={executionForm.quantityProduced}
                        onChange={(e) => setExecutionForm({...executionForm, quantityProduced: e.target.value})}
                        placeholder="Количество деталей"
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                        min="1"
                        max={remainingQuantity}
                      />
                      <p className="text-xs text-orange-600 mt-1">
                        Максимум: {remainingQuantity} шт (остается произвести)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2">
                        🔧 Номер установки
                      </label>
                      <select
                        value={executionForm.setupNumber}
                        onChange={(e) => setExecutionForm({...executionForm, setupNumber: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value={1}>Установка 1</option>
                        <option value={2}>Установка 2</option>
                        <option value={3}>Установка 3</option>
                        <option value={4}>Установка 4</option>
                      </select>
                      <p className="text-xs text-orange-600 mt-1">
                        Выберите номер технологической установки
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowExecutionForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      ✅ Зафиксировать работу
                    </button>
                  </div>
                </form>
              )}

              {detailedCard.executions && detailedCard.executions.length > 0 ? (
                <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                          📅 Дата и время
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">
                          👤 Исполнитель
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b">
                          📊 Количество
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-b">
                          🔧 Установка
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {detailedCard.executions
                        .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
                        .map((execution, index) => (
                        <tr key={execution.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(execution.executedAt).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {execution.executor.firstName} {execution.executor.lastName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {execution.quantityProduced} шт
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                              #{execution.setupNumber || 1}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-6xl text-gray-400 mb-4">📝</div>
                  <p className="text-gray-500 text-lg mb-2">Пока нет записей о выполненной работе</p>
                  {canAddExecution && detailedCard.status === 'active' ? (
                    <p className="text-sm text-gray-400">
                      Нажмите кнопку "Зафиксировать работу" чтобы добавить первую запись
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Записи появятся после выполнения работ по данной техкарте
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechCardViewer;

