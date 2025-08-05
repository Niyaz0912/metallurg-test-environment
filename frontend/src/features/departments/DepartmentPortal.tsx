// frontend/src/features/departments/DepartmentPortal.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';

// Импортируйте компоненты департаментов
import AdministrativeMain from './sections/Administrative/AdministrativeMain';
import CommercialMain from './sections/Commercial/CommercialMain';
import FinancialMain from './sections/Financial/FinancialMain';
import HRMain from './sections/HR/HRMain';
import ProductionMain from './sections/Production/ProductionMain';
import QualityMain from './sections/Quality/QualityMain';

const DepartmentPortal: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const { user } = useAuth();

  // Проверка прав доступа
  if (!user || (user.department?.id.toString() !== departmentId && user.role !== 'admin')) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Доступ запрещен</h2>
        <p>У вас нет прав для просмотра этого департамента.</p>
      </div>
    );
  }

  // Маппинг департаментов к компонентам
  const departmentComponents: { [key: string]: React.ComponentType } = {
    '1': AdministrativeMain,
    '2': CommercialMain,
    '3': FinancialMain,
    '4': HRMain,
    '5': ProductionMain,
    '6': QualityMain,
  };

  const DepartmentComponent = departmentComponents[departmentId || ''];

  if (!DepartmentComponent) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Департамент не найден</h2>
        <p>Департамент с ID {departmentId} не существует.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Портал департамента: {user.department?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Добро пожаловать, {user.firstName} {user.lastName}
        </p>
      </div>
      
      <DepartmentComponent />
    </div>
  );
};

export default DepartmentPortal;
