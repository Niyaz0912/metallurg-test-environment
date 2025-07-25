// src/features/departments/DepartmentPortal.tsx
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/hooks/useAuth';
import AdministrativeMain from './sections/Administrative/AdministrativeMain';
import QualityMain from './sections/Quality/QualityMain';
import HRMain from './sections/HR/HRMain';
import CommercialMain from './sections/Commercial/CommercialMain';
import ProductionMain from './sections/Production/ProductionMain';
import FinancialMain from './sections/Financial/FinancialMain';

const DepartmentPortal = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const { user } = useAuth();

  if (!departmentId || !user) {
    return <Navigate to="/" />;
  }

  // Проверка доступа
  if (user.department?.id.toString() !== departmentId && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const departmentComponents: Record<string, React.FC> = {
    '1': AdministrativeMain,
    '2': QualityMain,
    '3': HRMain,
    '4': CommercialMain,
    '5': ProductionMain,
    '6': FinancialMain
  };

  const DepartmentComponent = departmentComponents[departmentId];

  if (!DepartmentComponent) {
    return <div>Департамент не найден</div>;
  }

  return <DepartmentComponent />;
};

export default DepartmentPortal;