// frontend/src/features/techCard/components/TechCardCard.tsx
import React, { useState } from 'react';
import { 
  type TechCard,
  getTechCardProgress,
  getUniqueOperatorsCount
} from '../../../shared/api/techCardsApi';

interface TechCardCardProps {
  techCard: TechCard;
  onView: (techCard: TechCard) => void;
  onEdit?: (techCard: TechCard) => void;
  onDelete?: (techCard: TechCard) => void;
  onStatusChange?: (techCard: TechCard, status: 'draft' | 'active' | 'archived') => void;
  compact?: boolean;
}

const TechCardCard: React.FC<TechCardCardProps> = ({
  techCard,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false
}) => {
  const [showActions, setShowActions] = useState(false);

  const progress = getTechCardProgress(techCard);
  const operatorsCount = getUniqueOperatorsCount(techCard);
  const remainingQuantity = techCard.quantity - techCard.totalProducedQuantity;

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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'archived') => {
    if (onStatusChange) {
      onStatusChange(techCard, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Заголовок карточки */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {techCard.productName}
            </h3>
            {techCard.partNumber && (
              <p className="text-sm text-gray-600 mb-2">
                🏷️ {techCard.partNumber}
              </p>
            )}
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(techCard.status)}`}>
                {getStatusText(techCard.status)}
              </span>
              {techCard.pdfUrl && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded border border-purple-200">
                  📄 PDF
                </span>
              )}
            </div>
          </div>

          {/* Меню действий */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onView(techCard);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    👁️ Просмотр
                  </button>
                  
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(techCard);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ✏️ Редактировать
                    </button>
                  )}

                  {onStatusChange && (
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500">Изменить статус:</div>
                      {(['draft', 'active', 'archived'] as const).map(status => (
                        status !== techCard.status && (
                          <button
                            key={status}
                            onClick={() => {
                              handleStatusChange(status);
                              setShowActions(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {getStatusText(status)}
                          </button>
                        )
                      ))}
                    </div>
                  )}

                  {onDelete && (
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onDelete(techCard);
                          setShowActions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Информация о заказе */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="text-gray-500">🏢 Заказчик:</span>
            <span className="ml-2 font-medium text-gray-900">{techCard.customer}</span>
          </div>
          <div>
            <span className="text-gray-500">📋 Заказ:</span>
            <span className="ml-2 font-medium text-gray-900">{techCard.order}</span>
          </div>
          <div>
            <span className="text-gray-500">📊 Количество:</span>
            <span className="ml-2 font-medium text-gray-900">{techCard.quantity.toLocaleString()} шт</span>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Прогресс</span>
            <span className="text-sm font-bold text-gray-900">
              {techCard.totalProducedQuantity.toLocaleString()} / {techCard.quantity.toLocaleString()} ({progress}%)
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>

          {remainingQuantity > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Осталось: {remainingQuantity.toLocaleString()} шт
            </p>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <span>👥 {operatorsCount} операторов</span>
            <span>📝 {techCard.executions?.length || 0} записей</span>
          </div>
          <span>
            {new Date(techCard.createdAt).toLocaleDateString('ru-RU')}
          </span>
        </div>
      </div>

      {/* Кнопка просмотра */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onView(techCard)}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          👁️ Открыть техкарту
        </button>
      </div>

      {/* Клик вне меню для закрытия */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default TechCardCard;
