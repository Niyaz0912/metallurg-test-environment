// frontend/src/features/productionPlans/components/ProductionPlansManager.tsx
import React, { useState, useEffect } from 'react';

interface ProductionPlan {
  id: number;
  orderName: string;
  customerName: string;
  quantity: number;
  deadline: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductionPlansManagerProps {
  onClose?: () => void;
}

const ProductionPlansManager: React.FC<ProductionPlansManagerProps> = ({ onClose }) => {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/productionPlans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch {  // ✅ ИСПРАВЛЕНО: убран параметр _error
      console.error('Ошибка загрузки планов:');  // ✅ ИСПРАВЛЕНО: убран _error из console.error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот план?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/productionPlans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchPlans(); // Обновляем список
      } else {
        alert('Ошибка удаления плана');
      }
    } catch {  // ✅ ИСПРАВЛЕНО: убран параметр _error
      console.error('Ошибка удаления:');  // ✅ ИСПРАВЛЕНО: убран _error из console.error
      alert('Ошибка соединения');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 50) return 'bg-yellow-500';
    if (percent >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <div className="text-center py-4">Загрузка планов производства...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">📋 Управление планами производства</h3>
        <div className="space-x-2">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showCreateForm ? 'Отменить' : '+ Создать план'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Закрыть
            </button>
          )}
        </div>
      </div>

      {/* Форма создания/редактирования */}
      {(showCreateForm || editingPlan) && (
        <ProductionPlanForm
          plan={editingPlan}
          onSaved={() => {
            setShowCreateForm(false);
            setEditingPlan(null);
            fetchPlans();
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingPlan(null);
          }}
        />
      )}

      {/* Список планов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказчик
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Количество
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Срок
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Прогресс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {plan.orderName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {plan.customerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {plan.quantity} шт.
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(plan.deadline)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(plan.progressPercent)}`}
                          style={{ width: `${plan.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {plan.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {plans.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Планы производства не найдены
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{plans.length}</div>
          <div className="text-sm text-blue-800">Всего планов</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {plans.filter(p => p.progressPercent >= 80).length}
          </div>
          <div className="text-sm text-green-800">Почти готово</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {plans.filter(p => p.progressPercent > 0 && p.progressPercent < 80).length}
          </div>
          <div className="text-sm text-yellow-800">В работе</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {plans.filter(p => p.progressPercent === 0).length}
          </div>
          <div className="text-sm text-red-800">Не начато</div>
        </div>
      </div>
    </div>
  );
};

// Компонент формы (отдельный файл или в том же файле)
const ProductionPlanForm: React.FC<{
  plan?: ProductionPlan | null;
  onSaved: () => void;
  onCancel: () => void;
}> = ({ plan, onSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    orderName: plan?.orderName || '',
    customerName: plan?.customerName || '',
    quantity: plan?.quantity?.toString() || '',
    deadline: plan?.deadline ? plan.deadline.split('T')[0] : '',
    progressPercent: plan?.progressPercent?.toString() || '0'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = plan 
        ? `/api/productionPlans/${plan.id}`
        : '/api/productionPlans';
      
      const method = plan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          progressPercent: parseInt(formData.progressPercent)
        })
      });

      if (response.ok) {
        onSaved();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка сохранения');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h4 className="text-lg font-medium mb-4">
        {plan ? 'Редактировать план' : 'Создать новый план'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Номер заказа
            </label>
            <input
              type="text"
              value={formData.orderName}
              onChange={(e) => setFormData({ ...formData, orderName: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: MS-2025-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Заказчик
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Название компании"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Количество
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Срок выполнения
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Прогресс (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.progressPercent}
              onChange={(e) => setFormData({ ...formData, progressPercent: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Отменить
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductionPlansManager;
