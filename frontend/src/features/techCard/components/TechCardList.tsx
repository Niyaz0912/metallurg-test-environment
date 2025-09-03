// frontend/src/features/techCard/components/TechCardList.tsx
import React from 'react';

import { 
  type TechCard,
  getTechCardProgress,
  isTechCardOverdue,
  getDaysToDeadline,
  getPriorityColor
} from "../../../shared/api/techCardsApi";

interface TechCardListProps {
  techCards: TechCard[];
  onView: (card: TechCard) => void;  // ← добавить эту строку
  onEdit?: (card: TechCard) => void;
  onDelete?: (card: TechCard) => void;
  onStatusChange?: (card: TechCard, newStatus: 'draft' | 'active' | 'archived') => Promise<void>;
}

const TechCardList: React.FC<TechCardListProps> = ({ 
  techCards, 
  onView,
  onEdit
}) => {
  const getPriorityText = (priority: string) => {
    const priorities = {
      low: '🟢 Низкий',
      medium: '🟡 Средний',
      high: '🟠 Высокий',
      urgent: '🔴 Срочный'
    };
    return priorities[priority as keyof typeof priorities] || priority;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '📝 Черновик';
      case 'active': return '✅ Активная';
      case 'archived': return '📁 Архив';
      default: return status;
    }
  };

  if (techCards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Техкарты не найдены</h3>
        <p className="text-gray-500">Пока нет созданных техкарт</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {techCards.map((card) => {
        const progress = getTechCardProgress(card);
        const isOverdue = isTechCardOverdue(card);
        const daysToDeadline = getDaysToDeadline(card);

        return (
          <div
            key={card.id}
            className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView?.(card)} // ← Исправлено: onCardClick -> onView
          >
            {/* Заголовок карточки */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {card.productName}
                </h3>
                <span 
                  className="px-2 py-1 text-xs font-medium rounded-full ml-2"
                  style={{ 
                    backgroundColor: `${getPriorityColor(card.priority)}20`,
                    color: getPriorityColor(card.priority)
                  }}
                >
                  {getPriorityText(card.priority)}
                </span>
              </div>
              
              {card.partNumber && (
                <div className="text-sm text-gray-500 mb-2">
                  🏷️ {card.partNumber}
                </div>
              )}

              <div className="text-sm text-gray-600">
                <div><strong>Заказчик:</strong> {card.customer}</div>
                <div><strong>Заказ:</strong> {card.order}</div>
              </div>
            </div>

            {/* Прогресс */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Прогресс</span>
                <span className="text-sm text-gray-900">
                  {card.totalProducedQuantity} / {card.quantity} ({progress}%)
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    progress >= 100 ? 'bg-green-500' :
                    progress >= 75 ? 'bg-blue-500' :
                    progress >= 50 ? 'bg-yellow-500' :
                    progress >= 25 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Статус и даты */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                  {getStatusText(card.status)}
                </span>
                
                {card.pdfUrl && (
                  <span className="text-xs text-purple-600">
                    📄 PDF
                  </span>
                )}
              </div>

              {card.plannedEndDate && (
                <div className="text-xs text-gray-500 mt-2">
                  📅 План: {new Date(card.plannedEndDate).toLocaleDateString('ru-RU')}
                  {daysToDeadline !== null && !card.actualEndDate && (
                    <div className={`mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {daysToDeadline < 0 ? 
                        `⚠️ Просрочено на ${Math.abs(daysToDeadline)} дн.` : 
                        `⏰ Осталось ${daysToDeadline} дн.`
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Кнопки действий */}
              {onEdit && ( // ← Исправлено: onCardEdit -> onEdit
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(card); // ← Исправлено: onCardEdit -> onEdit
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ✏️ Редактировать
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechCardList;
