import React from 'react';
import ProductionPlanCard from './ProductionPlanCard';

type ProductionPlan = {
  id: number;
  orderName: string;
  customerName: string;
  quantity: number;
  deadline: string;
  progressPercent: number;
};

type Props = {
  plans: ProductionPlan[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

const ProductionPlanList: React.FC<Props> = ({ plans, onEdit, onDelete }) => {
  if (!plans.length) return <p>Планы производства отсутствуют.</p>;

  return (
    <div className="flex flex-col gap-4">
      {plans.map(plan => (
        <ProductionPlanCard key={plan.id} plan={plan} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ProductionPlanList;
