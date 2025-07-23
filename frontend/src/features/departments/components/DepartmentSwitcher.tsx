import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface DepartmentNames {
  [key: string]: string;
}

export const DepartmentSwitcher: React.FC = () => {
  const userRole = localStorage.getItem('userRole');
  const departmentId = localStorage.getItem('departmentId');
  const navigate = useNavigate();

  const departmentNames: DepartmentNames = {
    '1': 'Административный департамент',
    '2': 'Департамент качества',
    '3': 'Департамент персонала',
    '4': 'Коммерческий департамент',
    '5': 'Производственный департамент',
    '6': 'Финансовый департамент',
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('departmentId');
    window.location.href = 'http://localhost:5173/'; // Перенаправление на страницу авторизации
  };

  const goToMain = () => {
    window.location.href = 'http://localhost:5173/'; // Перенаправление на главную
  };

  if (userRole === 'admin') {
    return (
      <div className="flex items-center gap-4">
        <select
          onChange={(e) => navigate(`/department/${e.target.value}`)}
          className="p-2 border rounded"
          defaultValue={departmentId || ''}
        >
          {Object.entries(departmentNames).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <button 
          onClick={goToMain}
          className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
        >
          На главную
        </button>
        <button 
          onClick={handleLogout}
          className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        to={`/department/${departmentId}`}
        className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        {departmentNames[departmentId || ''] || 'Мой отдел'}
      </Link>
      <button 
        onClick={goToMain}
        className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
      >
        На главную
      </button>
      <button 
        onClick={handleLogout}
        className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
      >
        Выйти
      </button>
    </div>
  );
};