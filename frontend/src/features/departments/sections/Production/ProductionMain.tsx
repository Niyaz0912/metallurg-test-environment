import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductionTasks } from './ProductionTask';
import { ProductionReports } from './ProductionReports';
import { EquipmentStatus } from './EquipmentStatus';

interface Task {
  id: number;
  title: string;
  status: string;
}

interface Report {
  id: number;
  title: string;
}

interface Equipment {
  id: number;
  name: string;
  status: string;
}

interface ProductionData {
  tasks: Task[];
  reports: Report[];
  equipment: Equipment[];
}

const ProductionMain = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'reports' | 'equipment'>('tasks');
  
  const { data, isLoading, error } = useQuery<ProductionData>({
    queryKey: ['productionData'],
    queryFn: async () => {
      // В реальном приложении здесь будет запрос к API
      return {
        tasks: [
          { id: 1, title: 'Контроль качества', status: 'В работе' }
        ],
        reports: [
          { id: 1, title: 'Ежедневный отчёт' }
        ],
        equipment: [
          { id: 1, name: 'Печь', status: 'Работает' }
        ]
      };
    },
    staleTime: 60 * 1000 // 1 минута до повторного запроса
  });

  if (isLoading) return <div className="p-4 text-center">Загрузка данных...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Ошибка загрузки данных</div>;

  return (
    <div className="production-department p-4">
      <div className="tabs mb-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'tasks' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Производственные задачи
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'reports'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Отчёты
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'equipment'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Состояние оборудования
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'tasks' && <ProductionTasks tasks={data?.tasks || []} />}
        {activeTab === 'reports' && <ProductionReports reports={data?.reports || []} />}
        {activeTab === 'equipment' && <EquipmentStatus equipment={data?.equipment || []} />}
      </div>
    </div>
  );
};
export default ProductionMain;