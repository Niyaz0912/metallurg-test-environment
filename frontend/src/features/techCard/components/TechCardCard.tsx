// frontend/src/features/techCards/components/TechCardCard.tsx
import React, { useState } from 'react';

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
  const [showMenu, setShowMenu] = useState(false);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleStatusChange = (newStatus: 'draft' | 'active' | 'archived') => {
    if (onStatusChange && techCard.status !== newStatus) {
      onStatusChange(techCard, newStatus);
      setShowMenu(false);
    }
  };

  const cardHeight = compact ? 'h-48' : 'h-auto min-h-[320px]';

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${cardHeight} flex flex-col`}>
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-3">
            <h3 
              className="font-semibold text-gray-900 text-lg line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => onView(techCard)}
              title={techCard.productName}
            >
              {techCard.productName}
            </h3>
            {techCard.partNumber && (
              <p className="text-sm text-indigo-600 font-medium mt-1">
                Артикул: {techCard.partNumber}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(techCard.status)}`}>
              {getStatusText(techCard.status)}
            </span>
            
            {(onStatusChange || onEdit || onDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  ⚙️
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(techCard);
                          setShowMenu(false);
                        }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        ✏️ Редактировать
                      </button>
                    )}
                    
                    {onStatusChange && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => handleStatusChange('draft')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          disabled={techCard.status === 'draft'}
                        >
                          📝 Черновик
                        </button>
                        <button
                          onClick={() => handleStatusChange('active')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          disabled={techCard.status === 'active'}
                        >
                          ✅ Активная
                        </button>
                        <button
                          onClick={() => handleStatusChange('archived')}
                          className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          disabled={techCard.status === 'archived'}
                        >
                          📁 Архив
                        </button>
                      </>
                    )}
                    
                    {onDelete && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => {
                            onDelete(techCard);
                            setShowMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          🗑️ Удалить
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {techCard.description && !compact && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {techCard.description}
          </p>
        )}
      </div>

      {/* Превью чертежа */}
      {techCard.drawingUrl && !compact && (
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="h-32 bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={techCard.drawingUrl}
              alt="Превью чертежа"
              className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => onView(techCard)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">🖼️ Чертеж недоступен</div>';
              }}
            />
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
              {techCard.totalUsageCount}
            </p>
            <p className="text-xs text-gray-500">Использований</p>
          </div>
          <div>
            <p className={`font-bold text-green-600 ${compact ? 'text-base' : 'text-lg'}`}>
              {techCard.totalProducedQuantity}
            </p>
            <p className="text-xs text-gray-500">Произведено</p>
          </div>
          <div>
            <p className={`font-bold text-blue-600 ${compact ? 'text-base' : 'text-lg'}`}>
              {techCard.executions?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Записей</p>
          </div>
        </div>

        {/* Дополнительная информация */}
        {!compact && (
          <div className="text-sm text-gray-600 space-y-1 mb-4">
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
        )}

        {/* Кнопки действий */}
        <div className="mt-auto">
          <div className={compact ? 'flex space-x-1' : 'flex space-x-2'}>
            <button
              onClick={() => onView(techCard)}
              className={`flex-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors font-medium ${
                compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
              }`}
            >
              👁️ Просмотр
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(techCard)}
                className={`flex-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors font-medium ${
                  compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                }`}
              >
                ✏️ Править
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(techCard)}
                className={`bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors font-medium ${
                  compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                }`}
                title="Удалить"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay для закрытия меню при клике вне его */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default TechCardCard;
