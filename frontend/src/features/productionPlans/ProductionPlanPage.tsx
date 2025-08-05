// src/features/productionPlans/ProductionPlansPage.tsx
import { useState, useEffect } from 'react';
import { ProductionPlansList } from './components/ProductionPlanList';
import { ProductionPlan, CreateProductionPlanData } from './productionPlansTypes';

export const ProductionPlansPage = () => {
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userRole = 'director';

  useEffect(() => {
    const mockPlans: ProductionPlan[] = [
      {
        id: 1,
        orderName: 'PT-2024-005',
        customerName: 'АО "ПромТех"',
        quantity: 300,
        deadline: '2025-07-24',
        progressPercent: 0
      },
      {
        id: 2,
        orderName: 'MS-2023-001',
        customerName: 'ООО "МеталлСтрой"',
        quantity: 500,
        deadline: '2025-07-10',
        progressPercent: 20
      },
      {
        id: 3,
        orderName: 'US-2025-007',
        customerName: 'ЗАО "УралСталь"',
        quantity: 1000,
        deadline: '2025-08-05',
        progressPercent: 60
      }
    ];
    
    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 500);
  }, []);

  const handleCreatePlan = async (data: CreateProductionPlanData) => {
    try {
      const newPlan: ProductionPlan = {
        id: Date.now(),
        ...data,
        progressPercent: 0
      };
      
      setPlans(prev => [...prev, newPlan]);
    } catch (error) {
      console.error('Ошибка создания плана:', error);
    }
  };

  const handleUpdatePlan = async (id: number, data: CreateProductionPlanData) => {
    try {
      setPlans(prev => prev.map(plan => 
        plan.id === id 
          ? { ...plan, ...data }
          : plan
      ));
    } catch (error) {
      console.error('Ошибка обновления плана:', error);
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      setPlans(prev => prev.filter(plan => plan.id !== id));
    } catch (error) {
      console.error('Ошибка удаления плана:', error);
    }
  };

  const handleViewPlan = (id: number) => {
    console.log('Просмотр плана', id);
    alert(`Переход к детальной странице плана ${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <ProductionPlansList
      plans={plans}
      userRole={userRole}
      onCreatePlan={handleCreatePlan}
      onUpdatePlan={handleUpdatePlan}
      onDeletePlan={handleDeletePlan}
      onViewPlan={handleViewPlan}
    />
  );
};

export default ProductionPlansPage;

