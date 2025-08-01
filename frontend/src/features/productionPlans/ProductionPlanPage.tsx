import React, { useEffect, useState } from 'react';
import ProductionPlanList from './components/ProductionPlanList'; // проверьте путь
import { ProductionPlan } from './productionPlansTypes'; // если есть типы

const ProductionPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/productionPlans')
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Данные с API:', data); // для отладки
        setPlans(data); // Поскольку API возвращает массив, не data.productionPlans
      })
      .catch(err => {
        console.error(err);
        setError('Не удалось загрузить планы производства');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (id: number) => {
    alert(`Редактирование заказа с ID ${id}`);
  };

  const handleDelete = (id: number) => {
    alert(`Удаление заказа с ID ${id}`);
  };

  if (loading) return <p>Загрузка планов производства...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Планы производства</h1>
      <ProductionPlanList plans={plans} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ProductionPlanPage;
