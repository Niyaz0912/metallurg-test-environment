import React, { useEffect, useState } from 'react';
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

interface Department {
  id: string;
  name: string;
}

interface User {
  firstName: string;
  lastName: string;
  role?: string | null;
  department?: { id: number; name: string } | null;
}

interface DepartmentPortalProps {
  user: User | null;
}

const DEPARTMENTS_LIST: Department[] = [
  { id: '1', name: 'Административный' },
  { id: '2', name: 'Quality' },
  { id: '3', name: 'HR' },
  { id: '4', name: 'Commercial' },
  { id: '5', name: 'Production' },
  { id: '6', name: 'Финансовый отдел' },
];

export const DepartmentPortal: React.FC<DepartmentPortalProps> = ({ user }) => {
  const { departmentId } = useParams<{ departmentId?: string }>();
  const navigate = useNavigate();

  const [currentDeptName, setCurrentDeptName] = useState<string>('');

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

  useEffect(() => {
    if (departmentId) {
      const dept = DEPARTMENTS_LIST.find(d => d.id === departmentId);
      setCurrentDeptName(dept ? dept.name : '');
    }
  }, [departmentId]);

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
        Портал департамента: {currentDeptName || `ID ${departmentId}`}
      </h1>
      <div className="bg-white p-4 rounded shadow">
        <DepartmentComponent />
      </div>
    </div>
  );
};

export default DepartmentPortal;
