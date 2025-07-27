import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AdministrativeMain from './sections/Administrative/AdministrativeMain';
import QualityMain from './sections/Quality/QualityMain';
import HRMain from './sections/HR/HRMain';
import CommercialMain from './sections/Commercial/CommercialMain';
import ProductionMain from './sections/Production/ProductionMain';
import FinancialMain from './sections/Financial/FinancialMain';

const departmentComponents = {
  '1': AdministrativeMain,
  '2': QualityMain,
  '3': HRMain,
  '4': CommercialMain,
  '5': ProductionMain,
  '6': FinancialMain,
} as const;

type DepartmentId = keyof typeof departmentComponents;

interface User {
  firstName: string;
  lastName: string;
  role?: string;
  department?: { id: number; name: string } | null;
}

interface DepartmentPortalProps {
  user: User | null;
}

export const DepartmentPortal: React.FC<DepartmentPortalProps> = ({ user }) => {
  const { departmentId } = useParams<{ departmentId?: string }>();
  const navigate = useNavigate();

  const isValidDepartment = (id: string | undefined): id is DepartmentId => {
    return !!id && id in departmentComponents;
  };

  useEffect(() => {
    console.log('DepartmentPortal params:', { departmentId, user });
  }, [departmentId, user]);

  useEffect(() => {
    if (!isValidDepartment(departmentId) || !user) {
      console.log('Invalid department or no user - redirecting', { departmentId, user });
      navigate('/', { replace: true });
      return;
    }

    if (!user.department || (user.role !== 'admin' && user.department.id.toString() !== departmentId)) {
      navigate('/', { replace: true });
      return;
    }
  }, [departmentId, user, navigate]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  if (!isValidDepartment(departmentId)) {
    return null;
  }

  const DepartmentComponent = departmentComponents[departmentId];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Портал департамента: {user.department?.name || `ID ${departmentId}`}
      </h1>
      <div className="bg-white p-4 rounded shadow">
        <DepartmentComponent />
      </div>
    </div>
  );
};

export default DepartmentPortal;

