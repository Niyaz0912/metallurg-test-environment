import React from 'react';
import { Link } from 'react-router-dom';

export const DepartmentSwitcher: React.FC = () => {
  const userRole = localStorage.getItem('userRole');
  const departmentId = localStorage.getItem('departmentId');

  if (userRole === 'admin') {
    return (
      <select
        onChange={(e) => window.location.href = `/department/${e.target.value}`}
        className="ml-4 p-2 border rounded"
        defaultValue="" // чтобы не было выбранного по умолчанию
      >
        <option value="1">Административный департамент</option>
        <option value="2">Департамент качества</option>
        <option value="3">Департамент персонала</option>
        <option value="4">Коммерческий департамент</option>
        <option value="5">Производственный департамент</option>
        <option value="6">Финансовый департамент</option>

      </select>
    );
  }

  return (
    <Link
      to={`/department/${departmentId}`}
      className="ml-4 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
    >
      Мой отдел
    </Link>
  );
};
