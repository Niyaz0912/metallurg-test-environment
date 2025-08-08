// frontend/src/features/techCards/TechCardsPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import { fetchTechCards, deleteTechCard, updateTechCardStatus } from '../../shared/api/techCardsApi';
import TechCardList from './components/TechCardList';
import TechCardForm from './components/TechCardForm';
import TechCardViewer from './components/TechCardViewer';

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

const TechCardsPage: React.FC = () => {
  const { user } = useAuth();
  
  // Состояния
  const [techCards, setTechCards] = useState<TechCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<TechCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модальные окна
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedCard, setSelectedCard] = useState<TechCard | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Права доступа
  const canManage = user?.role === 'master' || user?.role === 'admin';
  const canView = ['master', 'admin', 'employee', 'director'].includes(user?.role || '');

  // Загрузка данных
  const loadTechCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTechCards();
      setTechCards(data);
      setFilteredCards(data);
    } catch (err) {
      setError('Ошибка при загрузке технологических карт');
      console.error('Error loading tech cards:', err);
    } finally {
      setLoading(false);
    }
  };

  // Первичная загрузка
  useEffect(() => {
    if (canView) {
      loadTechCards();
    }
  }, [canView]);

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = techCards;

    // Поиск по названию и артикулу
    if (searchQuery) {
      filtered = filtered.filter(card => 
        card.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.partNumber && card.partNumber.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    setFilteredCards(filtered);
  }, [searchQuery, statusFilter, techCards]);

  // Обработчики событий
  const handleCreateCard = () => {
    setSelectedCard(null);
    setShowCreateForm(true);
    setShowEditForm(false);
    setShowViewer(false);
  };

  const handleEditCard = (card: TechCard) => {
    setSelectedCard(card);
    setShowEditForm(true);
    setShowCreateForm(false);
    setShowViewer(false);
  };

  const handleViewCard = (card: TechCard) => {
    setSelectedCard(card);
    setShowViewer(true);
    setShowCreateForm(false);
    setShowEditForm(false);
  };

  const handleDeleteCard = (card: TechCard) => {
    setSelectedCard(card);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCard) return;
    
    try {
      await deleteTechCard(selectedCard.id.toString());
      await loadTechCards();
      setShowDeleteConfirm(false);
      setSelectedCard(null);
    } catch (err) {
      alert('Ошибка при удалении техкарты');
      console.error('Error deleting tech card:', err);
    }
  };

  const handleStatusChange = async (card: TechCard, newStatus: 'draft' | 'active' | 'archived') => {
    try {
      await updateTechCardStatus(card.id.toString(), newStatus);
      await loadTechCards();
    } catch (err) {
      alert('Ошибка при изменении статуса');
      console.error('Error updating status:', err);
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedCard(null);
    loadTechCards();
  };

  const closeAllModals = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setShowViewer(false);
    setShowDeleteConfirm(false);
    setSelectedCard(null);
  };

  // Проверка прав доступа
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Доступ запрещён</h2>
          <p className="text-gray-500">У вас нет прав для просмотра технологических карт</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4">
        <h1 className="text-2xl font-bold text-indigo-900">
          🔧 Технологические карты
        </h1>
        <p className="text-indigo-700 mt-1">
          Управление технологическими картами производства
        </p>
      </div>

      {/* Основной контент */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Панель управления */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Поиск */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по названию или артикулу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Фильтр по статусу */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="active">Активные</option>
              <option value="archived">Архив</option>
            </select>
          </div>

          {/* Кнопки действий */}
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={handleCreateCard}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Создать техкарту
              </button>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Всего</h3>
            <p className="text-2xl font-bold text-gray-900">{techCards.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-600">Черновики</h3>
            <p className="text-2xl font-bold text-yellow-700">
              {techCards.filter(c => c.status === 'draft').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600">Активные</h3>
            <p className="text-2xl font-bold text-green-700">
              {techCards.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500">Архив</h3>
            <p className="text-2xl font-bold text-gray-600">
              {techCards.filter(c => c.status === 'archived').length}
            </p>
          </div>
        </div>

        {/* Список техкарт */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadTechCards}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Повторить попытку
            </button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Техкарты не найдены' 
                : 'Пока нет технологических карт'}
            </p>
            {canManage && !searchQuery && statusFilter === 'all' && (
              <button
                onClick={handleCreateCard}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Создать первую техкарту
              </button>
            )}
          </div>
        ) : (
          <TechCardList
            techCards={filteredCards}
            onView={handleViewCard}
            onEdit={canManage ? handleEditCard : undefined}
            onDelete={canManage ? handleDeleteCard : undefined}
            onStatusChange={canManage ? handleStatusChange : undefined}
          />
        )}
      </div>

      {/* Модальные окна */}
      {showCreateForm && (
        <TechCardForm
          onSuccess={handleFormSuccess}
          onCancel={closeAllModals}
        />
      )}

      {showEditForm && selectedCard && (
        <TechCardForm
          techCard={selectedCard}
          onSuccess={handleFormSuccess}
          onCancel={closeAllModals}
        />
      )}

      {showViewer && selectedCard && (
        <TechCardViewer
          techCard={selectedCard}
          onClose={closeAllModals}
          onEdit={canManage ? () => handleEditCard(selectedCard) : undefined}
        />
      )}

      {/* Подтверждение удаления */}
      {showDeleteConfirm && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              ⚠️ Подтверждение удаления
            </h3>
            <p className="text-gray-700 mb-6">
              Вы действительно хотите удалить техкарту <strong>"{selectedCard.productName}"</strong>?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Это действие нельзя отменить!
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Отменить
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechCardsPage;
