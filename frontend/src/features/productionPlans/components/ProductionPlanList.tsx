// src/features/productionPlans/components/ProductionPlansList.tsx
import { Plus, Upload } from 'lucide-react';
import { useState } from 'react';

import { ProductionPlan, CreateProductionPlanData } from '../productionPlansTypes';

import { CreatePlanModal } from './CreatePlanModal';
import { ProductionPlanCard } from './ProductionPlanCard';


interface ProductionPlansListProps {
  plans: ProductionPlan[];
  userRole: string;
  onCreatePlan: (data: CreateProductionPlanData) => void;
  onUpdatePlan: (id: number, data: CreateProductionPlanData) => void;
  onDeletePlan: (id: number) => void;
  onViewPlan: (id: number) => void;
}

export const ProductionPlansList = ({
  plans,
  userRole,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onViewPlan
}: ProductionPlansListProps) => {
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'director';

  const handleCreatePlan = (data: CreateProductionPlanData) => {
    onCreatePlan(data);
    setShowCreateModal(false);
  };

  const handleEditPlan = (plan: ProductionPlan) => {
    // Простое окно prompt для редактирования (пока без отдельного компонента)
    const newOrderName = prompt('Новое название заказа:', plan.orderName);
    const newCustomerName = prompt('Новый заказчик:', plan.customerName);
    
    if (newOrderName && newCustomerName) {
      const updatedData: CreateProductionPlanData = {
        orderName: newOrderName,
        customerName: newCustomerName,
        quantity: plan.quantity,
        deadline: plan.deadline
      };
      onUpdatePlan(plan.id, updatedData);
    }
  };

  const handleDeletePlan = (id: number) => {
    // Простое подтверждение (пока без отдельного компонента)
    if (window.confirm('Вы уверены, что хотите удалить этот план?')) {
      onDeletePlan(id);
    }
  };

  return (
    <div className="container mx-auto mt-4 px-4">
      
      {/* Заголовок и кнопки */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Список производственных планов
        </h1>
        
        {canEdit && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Создать новый план
            </button>
            
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
              onClick={() => alert('Функция загрузки из Excel будет добавлена позже')}
            >
              <Upload className="w-4 h-4" />
              Загрузить из Excel
            </button>
          </div>
        )}
      </div>

      {/* Сетка карточек */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <ProductionPlanCard
              key={plan.id}
              plan={plan}
              canEdit={canEdit}
              onView={onViewPlan}
              onEdit={handleEditPlan}
              onDelete={handleDeletePlan}
            />
          ))}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
          Нет доступных производственных планов
        </div>
      )}

      {/* Модальное окно создания */}
      {showCreateModal && (
        <CreatePlanModal
          onSubmit={handleCreatePlan}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

