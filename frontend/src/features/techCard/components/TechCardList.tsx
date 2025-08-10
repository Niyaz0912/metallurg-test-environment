// frontend/src/features/techCard/components/TechCardList.tsx
import React, { useState } from 'react';
import { 
  type TechCard,
  getTechCardProgress,
  // 🆕 Новые импорты
  type TechCardPriority,
  isTechCardOverdue
} from '../../../shared/api/techCardsApi';
import TechCardCard from './TechCardCard';

interface TechCardListProps {
  techCards: TechCard[];
  onView: (techCard: TechCard) => void;
  onEdit?: (techCard: TechCard) => void;
  onDelete?: (techCard: TechCard) => void;
  onStatusChange?: (techCard: TechCard, status: 'draft' | 'active' | 'archived') => void;
  compact?: boolean;
}

const TechCardList: React.FC<TechCardListProps> = ({
  techCards,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'customer' | 'order' | 'progress' | 'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // 🆕 Фильтр по приоритету
  const [priorityFilter, setPriorityFilter] = useState<TechCardPriority | 'all'>('all');

  // 🆕 Фильтрация по приоритету
  const filteredTechCards = techCards.filter(card => 
    priorityFilter === 'all' || card.priority === priorityFilter
  );

  // Сортировка техкарт
  const sortedTechCards = [...filteredTechCards].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.productName.localeCompare(b.productName);
        break;
      case 'customer':
        comparison = a.customer.localeCompare(b.customer);
        break;
      case 'order':
        comparison = a.order.localeCompare(b.order);
        break;
      case 'progress':
        const progressA = getTechCardProgress(a);
        const progressB = getTechCardProgress(b);
        comparison = progressA - progressB;
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      // 🆕 Сортировка по приоритету
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (techCards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет техкарт</h3>
        <p className="text-gray-500">Техкарты появятся после создания</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 🆕 Панель фильтрации и сортировки */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
        {/* Фильтр по приоритету */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Приоритет:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TechCardPriority | 'all')}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="all">Все</option>
            <option value="urgent">🔴 Срочный</option>
            <option value="high">🟠 Высокий</option>
            <option value="medium">🟡 Средний</option>
            <option value="low">🟢 Низкий</option>
          </select>
        </div>

        <div className="border-l border-gray-300 h-6 mx-2"></div>

        <span className="text-sm font-medium text-gray-700">Сортировать:</span>
        
        <button
          onClick={() => handleSortChange('date')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            sortBy === 'date'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Дате {getSortIcon('date')}
        </button>

        {/* 🆕 Сортировка по приоритету */}
        <button
          onClick={() => handleSortChange('priority')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            sortBy === 'priority'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Приоритету {getSortIcon('priority')}
        </button>

        <button
          onClick={() => handleSortChange('name')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            sortBy === 'name'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Названию {getSortIcon('name')}
        </button>

        <button
          onClick={() => handleSortChange('customer')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            sortBy === 'customer'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Заказчику {getSortIcon('customer')}
        </button>

        <button
          onClick={() => handleSortChange('progress')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            sortBy === 'progress'
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Прогрессу {getSortIcon('progress')}
        </button>

        {/* 🆕 Счетчики */}
        <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
          <span>Показано: {filteredTechCards.length}</span>
          <span>Всего: {techCards.length}</span>
          {/* Просроченные */}
          {techCards.filter(isTechCardOverdue).length > 0 && (
            <span className="text-red-600 font-medium">
              ⚠️ Просрочено: {techCards.filter(isTechCardOverdue).length}
            </span>
          )}
        </div>
      </div>

      {/* Список карточек */}
      <div className={`grid gap-4 ${
        compact 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {sortedTechCards.map((techCard) => (
          <TechCardCard
            key={techCard.id}
            techCard={techCard}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
};

export default TechCardList;
