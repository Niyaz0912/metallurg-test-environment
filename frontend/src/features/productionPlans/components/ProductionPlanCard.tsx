// src/features/productionPlans/components/ProductionPlanCard.tsx
import { Calendar, User } from 'lucide-react';

import { ProductionPlan } from '../productionPlansTypes'; // ИСПРАВЛЕНО: добавлен импорт

interface ProductionPlanCardProps {
  plan: ProductionPlan;
  onEdit?: (plan: ProductionPlan) => void;
  onDelete?: (id: number) => void;
  onView: (id: number) => void;
  canEdit: boolean;
}

export const ProductionPlanCard = ({ 
  plan, 
  onEdit, 
  onDelete, 
  onView, 
  canEdit 
}: ProductionPlanCardProps) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const completedQuantity = Math.round((plan.quantity * plan.progressPercent) / 100);
  const isOverdue = new Date(plan.deadline) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
      <div className="p-6 flex flex-col h-full">
        
        {/* Заголовок */}
        <h5 className="text-xl font-bold text-gray-800 mb-3">
          {plan.orderName || "Без названия"}
        </h5>

        {/* Основная информация */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">Заказчик:</span>
            <span className="ml-2">{plan.customerName}</span>
          </div>
        </div>

        {/* Прогресс */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold">Выполнено: {plan.progressPercent.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-5">
            <div 
              className={`h-5 rounded-full ${getProgressColor(plan.progressPercent)} flex items-center justify-center text-white text-xs font-medium`}
              style={{ width: `${plan.progressPercent}%` }}
            >
              {plan.progressPercent.toFixed(1)}%
            </div>
          </div>
          
          <small className="text-gray-500 text-sm">
            {completedQuantity} из {plan.quantity} шт.
          </small>
        </div>

        {/* Срок */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">Срок:</span>
            <span className="ml-2">{formatDate(plan.deadline)}</span>
          </div>
          
          {isOverdue && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Просрочен
            </span>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="mt-auto pt-4 flex gap-2">
          <button
            onClick={() => onView(plan.id)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
          >
            👁️ Подробнее
          </button>
          
          {canEdit && (
            <>
              <button
                onClick={() => onEdit?.(plan)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
              >
                ✏️ Редактировать
              </button>
              
              <button
                onClick={() => onDelete?.(plan.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
              >
                🗑️ Удалить
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
