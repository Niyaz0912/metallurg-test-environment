// frontend/src/features/techCard/TechCardsPage.tsx
import React, { useState, useEffect } from 'react';

import {
  fetchTechCards,
  deleteTechCard,
  updateTechCardStatus,
  type TechCard,
} from '../../../shared/api/techCardsApi';
import { useAuth } from '../../auth/hooks/useAuth';

import TechCardForm from '../components/TechCardForm';
import TechCardList from '../components/TechCardList';
import TechCardViewer from '../components/TechCardViewer';

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

  // ✅ ОБНОВЛЕННЫЕ фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

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

  // ✅ ОБНОВЛЕННАЯ фильтрация и поиск
  useEffect(() => {
    let filtered = techCards;

    // Поиск по названию, артикулу, заказчику и заказу
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.partNumber && card.partNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        card.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.order.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(card => card.status === statusFilter);
    }

    // ✅ НОВЫЙ фильтр по заказчикам
    if (customerFilter !== 'all') {
      filtered = filtered.filter(card => card.customer === customerFilter);
    }

    setFilteredCards(filtered);
  }, [searchQuery, statusFilter, customerFilter, techCards]);

  // ✅ НОВАЯ функция получения уникальных заказчиков
  const getUniqueCustomers = () => {
    const customers = Array.from(new Set(techCards.map(card => card.customer)));
    return customers.sort();
  };

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

  // ✅ НОВЫЕ статистические данные
  const statsData = {
    total: techCards.length,
    drafts: techCards.filter(c => c.status === 'draft').length,
    active: techCards.filter(c => c.status === 'active').length,
    archived: techCards.filter(c => c.status === 'archived').length,
    totalQuantity: techCards.reduce((sum, card) => sum + card.quantity, 0),
    totalProduced: techCards.reduce((sum, card) => sum + card.totalProducedQuantity, 0),
    uniqueCustomers: getUniqueCustomers().length,
    withPdf: techCards.filter(c => c.pdfUrl).length
  };

  // Проверка прав доступа
  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-700">Доступ запрещён</h2>
          <p className="text-gray-500">У вас нет прав для просмотра технологических карт</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ ОБНОВЛЕННЫЙ заголовок */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-400 p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">
          🔧 Технологические карты
        </h1>
        <p className="text-indigo-700">
          Упрощенное управление техкартами с PDF файлами и автоматическим отслеживанием
        </p>
        <div className="flex items-center space-x-4 mt-3 text-sm text-indigo-600">
          <span>📊 Всего: {statsData.total}</span>
          <span>🏢 Заказчиков: {statsData.uniqueCustomers}</span>
          <span>📄 С PDF: {statsData.withPdf}</span>
        </div>
      </div>

      {/* Основной контент */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* ✅ ОБНОВЛЕННАЯ панель управления */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Расширенный поиск */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Поиск по названию, артикулу, заказчику или номеру заказа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Фильтр по статусу */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все статусы</option>
              <option value="draft">📝 Черновик</option>
              <option value="active">✅ Активные</option>
              <option value="archived">📁 Архив</option>
            </select>

            {/* ✅ НОВЫЙ фильтр по заказчикам */}
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Все заказчики</option>
              {getUniqueCustomers().map(customer => (
                <option key={customer} value={customer}>{customer}</option>
              ))}
            </select>
          </div>

          {/* Кнопки действий */}
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={handleCreateCard}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                ➕ Создать техкарту
              </button>
            </div>
          )}
        </div>

        {/* ✅ ОБНОВЛЕННАЯ статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{statsData.total}</p>
            <p className="text-sm text-gray-600">Всего техкарт</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{statsData.drafts}</p>
            <p className="text-sm text-yellow-600">Черновики</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{statsData.active}</p>
            <p className="text-sm text-green-600">Активные</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-indigo-700">{statsData.totalQuantity.toLocaleString()}</p>
            <p className="text-sm text-indigo-600">План (шт)</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{statsData.totalProduced.toLocaleString()}</p>
            <p className="text-sm text-emerald-600">Произведено</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{statsData.uniqueCustomers}</p>
            <p className="text-sm text-blue-600">Заказчиков</p>
          </div>
        </div>

        {/* Активные фильтры */}
        {(searchQuery || statusFilter !== 'all' || customerFilter !== 'all') && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Активные фильтры:</span>
            {searchQuery && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                Поиск: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                Статус: {statusFilter}
                <button
                  onClick={() => setStatusFilter('all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {customerFilter !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                Заказчик: {customerFilter}
                <button
                  onClick={() => setCustomerFilter('all')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCustomerFilter('all');
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Очистить все
            </button>
          </div>
        )}

        {/* Список техкарт */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className="text-gray-600">Загрузка техкарт...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadTechCards}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 Повторить попытку
            </button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              {searchQuery || statusFilter !== 'all' || customerFilter !== 'all' ? '🔍' : '📄'}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' || customerFilter !== 'all'
                ? 'Техкарты не найдены'
                : 'Пока нет технологических карт'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' || customerFilter !== 'all'
                ? 'Попробуйте изменить параметры поиска'
                : 'Создайте первую техкарту для начала работы'}
            </p>
            {canManage && !searchQuery && statusFilter === 'all' && customerFilter === 'all' && (
              <button
                onClick={handleCreateCard}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                ➕ Создать первую техкарту
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Информация о результатах */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Показано {filteredCards.length} из {techCards.length} техкарт
              </p>
              {filteredCards.length !== techCards.length && (
                <p className="text-sm text-gray-500">
                  Применены фильтры
                </p>
              )}
            </div>

            <TechCardList
              techCards={filteredCards}
              onView={handleViewCard}
              onEdit={canManage ? handleEditCard : undefined}
              onDelete={canManage ? handleDeleteCard : undefined}
              onStatusChange={canManage ? handleStatusChange : undefined}
            />
          </>
        )}
      </div>

      {/* ✅ ИСПРАВЛЕННЫЕ модальные окна */}
      {showCreateForm && (
        <TechCardForm
          onSuccess={handleFormSuccess}
          onClose={closeAllModals}
        />
      )}

      {showEditForm && selectedCard && (
        <TechCardForm
          techCard={selectedCard}
          onSuccess={handleFormSuccess}
          onClose={closeAllModals}
        />
      )}

      {showViewer && selectedCard && (
        <TechCardViewer
          techCard={selectedCard}
          onClose={closeAllModals}
          onEdit={canManage ? () => handleEditCard(selectedCard) : undefined}
        />
      )}

      {/* ✅ УЛУЧШЕННОЕ подтверждение удаления */}
      {showDeleteConfirm && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-red-500 text-3xl">⚠️</div>
                <h3 className="text-lg font-bold text-red-600">
                  Подтверждение удаления
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Вы действительно хотите удалить техкарту?
                </p>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="font-medium text-gray-900">{selectedCard.productName}</p>
                  <p className="text-sm text-gray-600">Заказчик: {selectedCard.customer}</p>
                  <p className="text-sm text-gray-600">Заказ: {selectedCard.order}</p>
                  {selectedCard.partNumber && (
                    <p className="text-sm text-gray-600">Артикул: {selectedCard.partNumber}</p>
                  )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ Это действие нельзя отменить!
                  </p>
                  <p className="text-red-600 text-sm mt-1">
                    Все связанные данные (выполнения, история доступов) также будут удалены.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Отменить
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Удалить техкарту
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechCardsPage;
