// src/features/productionPlans/ProductionPlansPage.tsx
import React, { useState, useEffect } from 'react';
import { ProductionPlansList } from './components/ProductionPlanList';
import { ProductionPlan, CreateProductionPlanData } from './productionPlansTypes';
import { useAuth } from '../auth/hooks/useAuth';

export const ProductionPlansPage = () => {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  // Определяем роль пользователя из контекста авторизации
  const userRole = user?.role || 'employee';

  useEffect(() => {
    fetchPlans();
  }, []);

  // ✅ ИСПРАВЛЕНИЕ: Загружаем данные из API вместо mock данных
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен авторизации не найден');
        return;
      }

      console.log('🔄 Загрузка планов производства из API...');

      const response = await fetch('/api/productionPlans', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📝 Статус ответа API:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Получены планы из БД:', data);

        // Преобразуем данные в нужный формат
        const formattedPlans: ProductionPlan[] = data.map((plan: any) => ({
          id: plan.id,
          orderName: plan.orderName,
          customerName: plan.customerName,
          quantity: plan.quantity,
          deadline: new Date(plan.deadline).toISOString().split('T')[0], // Преобразуем в формат YYYY-MM-DD
          progressPercent: plan.progressPercent || 0
        }));

        setPlans(formattedPlans);
        console.log(`📊 Загружено ${formattedPlans.length} планов производства`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        setError(errorData.error || `Ошибка ${response.status}`);
        console.error('❌ Ошибка загрузки планов:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ Ошибка запроса планов:', error);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (data: CreateProductionPlanData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/productionPlans', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ План создан успешно');
        // Перезагружаем список планов
        await fetchPlans();
      } else {
        const errorData = await response.json();
        console.error('❌ Ошибка создания плана:', errorData);
        alert(`Ошибка создания плана: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Ошибка создания плана:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const handleUpdatePlan = async (id: number, data: CreateProductionPlanData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/productionPlans/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        console.log('✅ План обновлен успешно');
        // Перезагружаем список планов
        await fetchPlans();
      } else {
        const errorData = await response.json();
        console.error('❌ Ошибка обновления плана:', errorData);
        alert(`Ошибка обновления плана: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Ошибка обновления плана:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот план?')) {
      return;
    }

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
        console.log('✅ План удален успешно');
        // Перезагружаем список планов
        await fetchPlans();
      } else {
        const errorData = await response.json();
        console.error('❌ Ошибка удаления плана:', errorData);
        alert(`Ошибка удаления плана: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Ошибка удаления плана:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const handleViewPlan = (id: number) => {
    console.log('👁️ Просмотр плана', id);
    alert(`Переход к детальной странице плана ${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Загрузка планов производства...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <div className="text-red-600 text-lg mb-4">❌ {error}</div>
        <button 
          onClick={fetchPlans}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📋 Планы производства
        </h1>
        <p className="text-gray-600">
          Всего планов: <span className="font-semibold">{plans.length}</span>
        </p>
      </div>

      <ProductionPlansList
        plans={plans}
        userRole={userRole}
        onCreatePlan={handleCreatePlan}
        onUpdatePlan={handleUpdatePlan}
        onDeletePlan={handleDeletePlan}
        onViewPlan={handleViewPlan}
      />
    </div>
  );
};

export default ProductionPlansPage;


