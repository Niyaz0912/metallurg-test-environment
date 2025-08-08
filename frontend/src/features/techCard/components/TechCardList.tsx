// frontend/src/features/techCards/components/TechCardList.tsx
import React from 'react';

interface TechCard {
  id: number;
  productName: string;
  partNumber?: string;
  description?: string;
  drawingUrl?: string;
  specifications?: any;
  productionStages?: any[];
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
  executions?: any[];
}

interface TechCardListProps {
  techCards: TechCard[];
  onView: (techCard: TechCard) => void;
  onEdit?: (techCard: TechCard) => void;
  onDelete?: (techCard: TechCard) => void;
  onStatusChange?: (techCard: TechCard, status: 'draft' | 'active' | 'archived') => void;
}

const TechCardList: React.FC<TechCardListProps> = ({
  techCards,
  onView,
  onEdit,
  onDelete,
  onStatusChange
}) => {
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
      case 'draft': return 'Черновик';
      case 'active': return 'Активная';
      case 'archived': return 'Архив';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleStatusChange = (techCard: TechCard, newStatus: 'draft' | 'active' | 'archived') => {
    if (onStatusChange && techCard.status !== newStatus) {
      onStatusChange(techCard, newStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {techCards.map((techCard) => (
        <div
          key={techCard.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          {/* Заголовок карточки */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 
                className="font-semibold text-gray-900 text-lg line-clamp-2 cursor-pointer hover:text-indigo-600"
                onClick={() => onView(techCard)}
                title={techCard.productName}
              >
                {techCard.productName}
              </h3>
              <div className="flex flex-col items-end space-y-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(techCard.status)}`}>
                  {getStatusText(techCard.status)}
                </span>
                {onStatusChange && (
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600 text-sm">
                      ⚙️
                    </button>
                    <div className="absolute right-0 top-6 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => handleStatusChange(techCard, 'draft')}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        disabled={techCard.status === 'draft'}
                      >
                        📝 Черновик
                      </button>
                      <button
                        onClick={() => handleStatusChange(techCard, 'active')}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        disabled={techCard.status === 'active'}
                      >
                        ✅ Активная
                      </button>
                      <button
                        onClick={() => handleStatusChange(techCard, 'archived')}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        disabled={techCard.status === 'archived'}
                      >
                        📁 Архив
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {techCard.partNumber && (
              <p className="text-sm text-indigo-600 font-medium">
                Артикул: {techCard.partNumber}
              </p>
            )}
            
            {techCard.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {techCard.description}
              </p>
            )}
          </div>

          {/* Превью чертежа */}
          {techCard.drawingUrl && (
            <div className="p-4 border-b border-gray-100">
              <div className="h-32 bg-gray-50 rounded-lg overflow-hidden">
                <img 
                  src={techCard.drawingUrl}
                  alt="Превью чертежа"
                  className="w-full h-full object-cover cursor-pointer hover:opacity-75"
                  onClick={() => onView(techCard)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">Чертеж недоступен</div>';
                  }}
                />
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{techCard.totalUsageCount}</p>
                <p className="text-xs text-gray-500">Использований</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{techCard.totalProducedQuantity}</p>
                <p className="text-xs text-gray-500">Произведено</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{techCard.executions?.length || 0}</p>
                <p className="text-xs text-gray-500">Записей</p>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="p-4 border-b border-gray-100 text-sm text-gray-600">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Версия:</span>
                <span className="font-medium">{techCard.version}</span>
              </div>
              {techCard.estimatedTimePerUnit && (
                <div className="flex justify-between">
                  <span>Время/деталь:</span>
                  <span className="font-medium">{techCard.estimatedTimePerUnit} мин</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Создана:</span>
                <span className="font-medium">{formatDate(techCard.createdAt)}</span>
              </div>
              {techCard.creator && (
                <div className="flex justify-between">
                  <span>Автор:</span>
                  <span className="font-medium">
                    {techCard.creator.firstName} {techCard.creator.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => onView(techCard)}
                className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors text-sm font-medium"
              >
                👁️ Просмотр
              </button>
              {onEdit && (
                <button
                  onClick={() => onEdit(techCard)}
                  className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm font-medium"
                >
                  ✏️ Править
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(techCard)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                  title="Удалить"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechCardList;

