

// frontend/src/features/techCard/components/TechCardsManager.tsx
import React, { useState, useEffect } from 'react';
import { 
  fetchTechCards, 
  deleteTechCard,
  updateTechCardStatus,
  type TechCard,
  type TechCardStatus,
  getTechCardProgress,
  isTechCardOverdue,
  getDaysToDeadline
} from '../../../shared/api/techCardsApi';
import TechCardForm from './TechCardForm';
import TechCardViewer from './TechCardViewer';

const TechCardsManager: React.FC = () => {
  const [techCards, setTechCards] = useState<TechCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  // ✅ ИСПРАВЛЕНО: Заменено null на undefined
  const [editingCard, setEditingCard] = useState<TechCard | undefined>(undefined);
  const [viewingCard, setViewingCard] = useState<TechCard | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TechCardStatus | 'all'>('all');

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
    if (!window.confirm('Вы уверены, что хотите удалить эту техкарту?')) return;

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

  // ✅ ИСПРАВЛЕНО: Заменено null на undefined
  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingCard(undefined);
    loadTechCards();
  };

  // Фильтрация техкарт
  const filteredCards = techCards.filter(card => {
    const matchesSearch = searchTerm === '' || 
      card.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.order.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <div>
          <h2 className="text-xl font-semibold">Управление техкартами</h2>
          <p className="text-gray-600 text-sm mt-1">Администрирование всех техкарт системы</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
        >
          + Создать техкарту
        </button>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Название, заказчик, заказ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TechCardStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="active">Активная</option>
              <option value="archived">Архив</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border">
          <div className="text-2xl font-bold text-blue-600">{techCards.length}</div>
          <div className="text-sm text-blue-600">Всего техкарт</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border">
          <div className="text-2xl font-bold text-green-600">
            {techCards.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-green-600">Активных</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border">
          <div className="text-2xl font-bold text-yellow-600">
            {techCards.filter(c => c.status === 'draft').length}
          </div>
          <div className="text-sm text-yellow-600">Черновиков</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border">
          <div className="text-2xl font-bold text-red-600">
            {techCards.filter(c => isTechCardOverdue(c)).length}
          </div>
          <div className="text-sm text-red-600">Просроченных</div>
        </div>
      </div>

      {/* Таблица техкарт */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Техкарты не найдены</h3>
            <p className="text-gray-500">Попробуйте изменить фильтры или создать новую техкарту</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Продукт</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказчик</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прогресс</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCards.map((card) => {
                const progress = getTechCardProgress(card);
                const isOverdue = isTechCardOverdue(card);
                const daysToDeadline = getDaysToDeadline(card);
                
                return (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{card.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{card.productName}</div>
                      {card.partNumber && (
                        <div className="text-sm text-gray-500">🏷️ {card.partNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{card.customer}</div>
                      <div className="text-sm text-gray-500">{card.order}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={card.status}
                        onChange={(e) => handleStatusChange(card, e.target.value as TechCardStatus)}
                        className="text-xs px-2 py-1 rounded border"
                      >
                        <option value="draft">📝 Черновик</option>
                        <option value="active">✅ Активная</option>
                        <option value="archived">📁 Архив</option>
                      </select>
                      {isOverdue && (
                        <div className="text-xs text-red-600 mt-1">⚠️ Просрочено</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{card.totalProducedQuantity} / {card.quantity}</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setViewingCard(card)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          👁️ Просмотр
                        </button>
                        <button
                          onClick={() => setEditingCard(card)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          ✏️ Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          🗑️ Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальные окна */}
      {/* ✅ ИСПРАВЛЕНО: Теперь типы совместимы */}
      {(showCreateForm || editingCard) && (
        <TechCardForm
          techCard={editingCard}
          onClose={handleFormClose}
          isEdit={!!editingCard}
        />
      )}

      {/* ✅ ИСПРАВЛЕНО: Заменено null на undefined */}
      {viewingCard && (
        <TechCardViewer
          techCard={viewingCard}
          onClose={() => setViewingCard(undefined)}
          onEdit={() => {
            setEditingCard(viewingCard);
            setViewingCard(undefined);
          }}
        />
      )}
    </div>
  );
};

export default TechCardsManager;
