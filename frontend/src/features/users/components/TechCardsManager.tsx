// frontend/src/features/users/components/TechCardsManager.tsx
import React, { useState, useEffect } from 'react';
import { 
  fetchTechCards, 
  deleteTechCard,
  updateTechCardStatus,
  type TechCard,
  type TechCardStatus,
  type TechCardPriority,
  getTechCardProgress,
  getPriorityColor,
  isTechCardOverdue,
  getDaysToDeadline
} from '../../../shared/api/techCardsApi';
import TechCardCreateForm from './TechCardCreateForm';
import TechCardEditForm from './TechCardEditForm';
import TechCardViewer from '../../techCard/components/TechCardViewer';

const TechCardsManager: React.FC = () => {
  const [techCards, setTechCards] = useState<TechCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCard, setEditingCard] = useState<TechCard | null>(null);
  const [viewingCard, setViewingCard] = useState<TechCard | null>(null);
  const [filter, setFilter] = useState<{
    status: TechCardStatus | 'all';
    priority: TechCardPriority | 'all';
    search: string;
  }>({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    loadTechCards();
  }, []);

  const loadTechCards = async () => {
    try {
      setLoading(true);
      const cards = await fetchTechCards();
      setTechCards(cards);
    } catch (error) {
      console.error('Ошибка загрузки техкарт:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту техкарту?')) {
      return;
    }

    try {
      await deleteTechCard(id.toString());
      setTechCards(cards => cards.filter(card => card.id !== id));
    } catch (error) {
      alert('Ошибка при удалении техкарты');
      console.error('Error deleting tech card:', error);
    }
  };

  const handleStatusChange = async (card: TechCard, newStatus: TechCardStatus) => {
    try {
      await updateTechCardStatus(card.id.toString(), newStatus);
      setTechCards(cards => 
        cards.map(c => c.id === card.id ? { ...c, status: newStatus } : c)
      );
    } catch (error) {
      alert('Ошибка при изменении статуса');
      console.error('Error updating status:', error);
    }
  };

  const handleCardCreated = () => {
    setShowCreateForm(false);
    loadTechCards();
  };

  const handleCardUpdated = () => {
    setEditingCard(null);
    loadTechCards();
  };

  // Фильтрация техкарт
  const filteredCards = techCards.filter(card => {
    const matchesStatus = filter.status === 'all' || card.status === filter.status;
    const matchesPriority = filter.priority === 'all' || card.priority === filter.priority;
    const matchesSearch = filter.search === '' || 
      card.productName.toLowerCase().includes(filter.search.toLowerCase()) ||
      card.customer.toLowerCase().includes(filter.search.toLowerCase()) ||
      card.order.toLowerCase().includes(filter.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: TechCardStatus) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: TechCardStatus) => {
    switch (status) {
      case 'draft': return '📝 Черновик';
      case 'active': return '✅ Активная';
      case 'archived': return '📁 Архив';
      default: return status;
    }
  };

  const getPriorityText = (priority: TechCardPriority) => {
    const priorities = {
      low: '🟢 Низкий',
      medium: '🟡 Средний',
      high: '🟠 Высокий',
      urgent: '🔴 Срочный'
    };
    return priorities[priority];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка техкарт...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Управление техкартами</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {showCreateForm ? 'Отменить' : '+ Создать техкарту'}
        </button>
      </div>

      {/* Форма создания */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <TechCardCreateForm onCardCreated={handleCardCreated} />
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Название, заказчик, заказ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as TechCardStatus | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="active">Активная</option>
              <option value="archived">Архив</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Приоритет
            </label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value as TechCardPriority | 'all' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все приоритеты</option>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
              <option value="urgent">Срочный</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ status: 'all', priority: 'all', search: '' })}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{techCards.length}</div>
          <div className="text-sm text-blue-600">Всего техкарт</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {techCards.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-green-600">Активных</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {techCards.filter(c => c.status === 'draft').length}
          </div>
          <div className="text-sm text-yellow-600">Черновиков</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {techCards.filter(c => isTechCardOverdue(c)).length}
          </div>
          <div className="text-sm text-red-600">Просроченных</div>
        </div>
      </div>

      {/* Список техкарт */}
      <div className="bg-white rounded-lg border">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Техкарты не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить фильтры или создать новую техкарту</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Продукт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказчик / Заказ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Приоритет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Прогресс
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map((card) => {
                  const progress = getTechCardProgress(card);
                  const isOverdue = isTechCardOverdue(card);
                  const daysToDeadline = getDaysToDeadline(card);
                  
                  return (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {card.productName}
                          </div>
                          {card.partNumber && (
                            <div className="text-sm text-gray-500">
                              🏷️ {card.partNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{card.customer}</div>
                        <div className="text-sm text-gray-500">{card.order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={card.status}
                          onChange={(e) => handleStatusChange(card, e.target.value as TechCardStatus)}
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(card.status)}`}
                        >
                          <option value="draft">Черновик</option>
                          <option value="active">Активная</option>
                          <option value="archived">Архив</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded"
                          style={{ 
                            backgroundColor: `${getPriorityColor(card.priority)}20`,
                            color: getPriorityColor(card.priority)
                          }}
                        >
                          {getPriorityText(card.priority)}
                        </span>
                        {isOverdue && (
                          <div className="text-xs text-red-600 mt-1">
                            ⚠️ Просрочено
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {card.totalProducedQuantity} / {card.quantity} ({progress}%)
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(card.createdAt).toLocaleDateString('ru-RU')}
                        {card.plannedEndDate && (
                          <div className={`text-xs mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                            📅 {new Date(card.plannedEndDate).toLocaleDateString('ru-RU')}
                            {daysToDeadline !== null && !card.actualEndDate && (
                              <span className="ml-1">
                                ({daysToDeadline < 0 ? `просрочено на ${Math.abs(daysToDeadline)} дн.` : `${daysToDeadline} дн.`})
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingCard(card)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Просмотр"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => setEditingCard(card)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Редактировать"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(card.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {editingCard && (
        <TechCardEditForm
          techCard={editingCard}
          onCardUpdated={handleCardUpdated}
          onClose={() => setEditingCard(null)}
        />
      )}

      {viewingCard && (
        <TechCardViewer
          techCard={viewingCard}
          onClose={() => setViewingCard(null)}
          onEdit={() => {
            setEditingCard(viewingCard);
            setViewingCard(null);
          }}
        />
      )}
    </div>
  );
};

export default TechCardsManager;
