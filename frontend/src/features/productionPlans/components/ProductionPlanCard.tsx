import React from 'react';

type ProductionPlan = {
  id: number;
  orderName: string;
  customerName: string;
  quantity: number;
  deadline: string;
  progressPercent: number;
};

type Props = {
  plan: ProductionPlan;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

const ProductionPlanCard: React.FC<Props> = ({ plan, onEdit, onDelete }) => {
  return (
    <div className="card">
      <h2>{plan.orderName}</h2>
      <p>Клиент: {plan.customerName}</p>
      <p>Количество: {plan.quantity}</p>
      <p>Дедлайн: {new Date(plan.deadline).toLocaleDateString()}</p>
      <p>Прогресс: {plan.progressPercent}%</p>
      <button onClick={() => onEdit && onEdit(plan.id)}>Редактировать</button>
      <button onClick={() => onDelete && onDelete(plan.id)}>Удалить</button>
    </div>
  );
};


export default ProductionPlanCard;
