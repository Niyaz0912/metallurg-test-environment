// frontend/src/features/techCards/components/TechCardViewer.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchTechCardById, addExecution } from '../../../shared/api/techCardsApi';
import { Document, Page, pdfjs } from 'react-pdf';

// ✅ ДОБАВЛЕНО: Настройка worker для PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface TechCard {
  id: number;
  productName: string;
  partNumber?: string;
  description?: string;
  drawingUrl?: string;
  specifications?: any;
  productionStages?: ProductionStage[];
  estimatedTimePerUnit?: number;
  notes?: string;
  status: 'draft' | 'active' | 'archived';
  version: string;
  totalUsageCount: number;
  totalProducedQuantity: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  executions?: TechCardExecution[];
}

interface ProductionStage {
  name: string;
  description: string;
  tools: string[];
  duration?: number;
  qualityCheckpoints?: string[];
}

interface TechCardExecution {
  id: number;
  stageName: string;
  quantityProduced: number;
  executedAt: string;
  qualityStatus?: 'OK' | 'NOK';
  qualityComment?: string;
  executor: {
    id: number;
    firstName: string;
    lastName: string;
  };
  qualityInspector?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface TechCardViewerProps {
  techCard: TechCard;
  onClose: () => void;
  onEdit?: () => void;
}

const TechCardViewer: React.FC<TechCardViewerProps> = ({ techCard, onClose, onEdit }) => {
  const { user } = useAuth();
  const [detailedCard, setDetailedCard] = useState<TechCard>(techCard);
  const [loading, setLoading] = useState(false);
  const [showExecutionForm, setShowExecutionForm] = useState(false);
  const [executionForm, setExecutionForm] = useState({
    stageName: '',
    quantityProduced: '',
    qualityStatus: '' as 'OK' | 'NOK' | '',
    qualityComment: ''
  });

  const canManage = user?.role === 'master' || user?.role === 'admin';
  const canAddExecution = ['master', 'admin', 'employee'].includes(user?.role || '');

  // Загружаем полную информацию о техкарте при открытии
  useEffect(() => {
    const loadDetailedCard = async () => {
      try {
        setLoading(true);
        const detailed = await fetchTechCardById(techCard.id.toString());
        setDetailedCard(detailed);
      } catch (error) {
        console.error('Error loading detailed tech card:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailedCard();
  }, [techCard.id]);

  // Обработчик добавления выполнения
  const handleAddExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executionForm.stageName || !executionForm.quantityProduced) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      await addExecution(techCard.id.toString(), {
        stageName: executionForm.stageName,
        quantityProduced: parseInt(executionForm.quantityProduced),
        qualityStatus: executionForm.qualityStatus || undefined,
        qualityComment: executionForm.qualityComment || undefined
      });

      // Перезагружаем данные
      const updated = await fetchTechCardById(techCard.id.toString());
      setDetailedCard(updated);
      
      // Сбрасываем форму
      setExecutionForm({
        stageName: '',
        quantityProduced: '',
        qualityStatus: '',
        qualityComment: ''
      });
      setShowExecutionForm(false);
      
    } catch (error) {
      alert('Ошибка при добавлении выполнения');
      console.error('Error adding execution:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'active': return 'Активная';
      case 'archived': return 'Архив';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{detailedCard.productName}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(detailedCard.status)}`}>
              {getStatusText(detailedCard.status)}
            </span>
            {detailedCard.partNumber && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {detailedCard.partNumber}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && canManage && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Редактировать
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Закрыть
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Основная информация */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Левая колонка - информация */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">📋 Основная информация</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Название продукта:</label>
                      <p className="text-gray-900">{detailedCard.productName}</p>
                    </div>
                    {detailedCard.partNumber && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Артикул:</label>
                        <p className="text-gray-900">{detailedCard.partNumber}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Версия:</label>
                      <p className="text-gray-900">{detailedCard.version}</p>
                    </div>
                    {detailedCard.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Описание:</label>
                        <p className="text-gray-900">{detailedCard.description}</p>
                      </div>
                    )}
                    {detailedCard.estimatedTimePerUnit && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Время на деталь:</label>
                        <p className="text-gray-900">{detailedCard.estimatedTimePerUnit} мин</p>
                      </div>
                    )}
                    {detailedCard.creator && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Создал:</label>
                        <p className="text-gray-900">
                          {detailedCard.creator.firstName} {detailedCard.creator.lastName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Статистика */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">📊 Статистика</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600">Использований</p>
                      <p className="text-2xl font-bold text-blue-900">{detailedCard.totalUsageCount}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Произведено</p>
                      <p className="text-2xl font-bold text-green-900">{detailedCard.totalProducedQuantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Правая колонка - чертеж */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🖼️ Чертеж</h3>
                {detailedCard.drawingUrl ? (
                  <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                    <img 
                      src={detailedCard.drawingUrl} 
                      alt="Чертеж детали"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-drawing.png';
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Чертеж не загружен</p>
                  </div>
                )}
              </div>
            </div>

            {/* Этапы производства */}
            {detailedCard.productionStages && detailedCard.productionStages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">⚙️ Этапы производства</h3>
                <div className="space-y-4">
                  {detailedCard.productionStages.map((stage, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{stage.name}</h4>
                          <p className="text-gray-600 mt-1">{stage.description}</p>
                          {stage.tools && stage.tools.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">Инструменты:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {stage.tools.map((tool, toolIndex) => (
                                  <span 
                                    key={toolIndex}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {stage.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              Время: {stage.duration} мин
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Таблица выполнений */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">📝 История выполнений</h3>
                {canAddExecution && detailedCard.status === 'active' && (
                  <button
                    onClick={() => setShowExecutionForm(!showExecutionForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    + Добавить выполнение
                  </button>
                )}
              </div>

              {/* Форма добавления выполнения */}
              {showExecutionForm && (
                <form onSubmit={handleAddExecution} className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Этап *
                      </label>
                      <input
                        type="text"
                        value={executionForm.stageName}
                        onChange={(e) => setExecutionForm({...executionForm, stageName: e.target.value})}
                        placeholder="Название этапа"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Количество *
                      </label>
                      <input
                        type="number"
                        value={executionForm.quantityProduced}
                        onChange={(e) => setExecutionForm({...executionForm, quantityProduced: e.target.value})}
                        placeholder="Произведено штук"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Статус качества
                      </label>
                      <select
                        value={executionForm.qualityStatus}
                        onChange={(e) => setExecutionForm({...executionForm, qualityStatus: e.target.value as 'OK' | 'NOK' | ''})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Не указан</option>
                        <option value="OK">OK</option>
                        <option value="NOK">NOK</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Комментарий
                      </label>
                      <input
                        type="text"
                        value={executionForm.qualityComment}
                        onChange={(e) => setExecutionForm({...executionForm, qualityComment: e.target.value})}
                        placeholder="Комментарий к качеству"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowExecutionForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Добавить
                    </button>
                  </div>
                </form>
              )}

              {/* Таблица выполнений */}
              {detailedCard.executions && detailedCard.executions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Дата</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Этап</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Исполнитель</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Кол-во</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Качество</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Комментарий</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedCard.executions.map((execution) => (
                        <tr key={execution.id}>
                          <td className="border border-gray-300 px-4 py-2">
                            {new Date(execution.executedAt).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {execution.stageName}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {execution.executor.firstName} {execution.executor.lastName}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {execution.quantityProduced}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {execution.qualityStatus ? (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                execution.qualityStatus === 'OK' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {execution.qualityStatus}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {execution.qualityComment || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Пока нет записей о выполнении
                </p>
              )}
            </div>

            {/* Дополнительные заметки */}
            {detailedCard.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">📄 Заметки</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{detailedCard.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechCardViewer;
