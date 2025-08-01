import React, { useEffect, useState } from 'react';
import { fetchProductionPlans } from '../../shared/api/productionPlansApi';

interface ProductionPlan {
  id: number;
  customerName: string;
  orderName: string;
  quantity: number;
  deadline: string;
  progressPercent: number;
}

const ProductionPlanList: React.FC = () => {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await fetchProductionPlans();
        setPlans(data);
      } catch (err) {
        setError('Ошибка при загрузке планов производства');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  if (loading) return <div>Загрузка планов производства...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Планы производства</h2>
      {plans.length === 0 ? (
        <p>Планы производства не найдены.</p>
      ) : (
        <ul>
          {plans.map((plan) => (
            <li key={plan.id}>
              <b>Заказ:</b> {plan.orderName} — {plan.quantity} шт. (Клиент: {plan.customerName})<br />
              <b>Дедлайн:</b> {new Date(plan.deadline).toLocaleDateString()}<br />
              <b>Прогресс:</b> {plan.progressPercent}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductionPlanList;
