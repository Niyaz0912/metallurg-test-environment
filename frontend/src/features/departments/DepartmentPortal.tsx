import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DepartmentSwitcher } from './components/DepartmentSwitcher';

const DepartmentPortal = () => {
  const { departmentId } = useParams();
  const userDepartmentId = localStorage.getItem('departmentId');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'admin' && departmentId !== userDepartmentId) {
      navigate(`/department/${userDepartmentId}`);
    }
  }, [departmentId, userDepartmentId, userRole, navigate]);

  const departmentNames: Record<string, string> = {
    '1': 'Административный департамент',
    '2': 'Департамент качества',
    '3': 'Департамент персонала',
    '4': 'Коммерческий департамент',
    '5': 'Производственный департамент',
    '6': 'Финансовый департамент',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">
          Портал отдела: {departmentNames[departmentId || ''] || departmentId}
        </h1>
        <DepartmentSwitcher />
      </div>

      {/* Остальное содержимое портала */}
    </div>
  );
};

export default DepartmentPortal;