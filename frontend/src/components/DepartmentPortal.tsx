import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DepartmentPortal = () => {
  const { departmentId } = useParams();
  const userDepartmentId = localStorage.getItem('departmentId');
  const userRole = localStorage.getItem('userRole');
  const navigate = useNavigate();

  // Проверка доступа
  useEffect(() => {
    if (userRole !== 'admin' && departmentId !== userDepartmentId) {
      window.location.href = `/department/${userDepartmentId}`;
    }
  }, [departmentId, userDepartmentId, userRole]);

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('departmentId');
    navigate('/'); // Переход на страницу входа или главную
  };

  // Тестовые данные по отделу — можно расширить/загружать с сервера
  const departmentNames: Record<string, string> = {
    '1': 'Административный департамент',
    '2': 'Департамент качества',
    '3': 'Департамент персонала',
    '4': 'Коммерческий департамент',
    '5': 'Производственный департамент',
    '6': 'Финансовый департамент',
  };

  const employees = [
    { id: 'e1', name: 'Иван Иванов', position: 'Менеджер' },
    { id: 'e2', name: 'Мария Смирнова', position: 'Специалист' },
    { id: 'e3', name: 'Петр Петров', position: 'Аналитик' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h1 className="text-3xl font-bold mb-4">
        Портал отдела: {departmentNames[departmentId || ''] || departmentId}
      </h1>

      {userRole === 'admin' && (
        <>
          <p className="mb-6 text-green-700 font-semibold">
            Вы видите этот портал как администратор.
          </p>

          <section className="mb-6 flex gap-4">
            <button
              onClick={() => window.location.href = 'http://localhost:5173/'}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
            >
              Перейти на главную страницу
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
            >
              Выйти
            </button>
          </section>
        </>
      )}

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Информация об отделе</h2>
        <p>
          Это тестовое описание для отдела &quot;{departmentNames[departmentId || ''] || departmentId}&quot;.
          Здесь можно разместить любые важные сведения, новости и обновления.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Сотрудники отдела</h2>
        <ul className="list-disc list-inside">
          {employees.map(emp => (
            <li key={emp.id}>
              {emp.name} — {emp.position}
            </li>
          ))}
        </ul>
      </section>

      {userRole === 'admin' && (
        <section>
          <button
            onClick={() => alert('Действие администратора выполнено')}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Выполнить админ-действие
          </button>
        </section>
      )}
    </div>
  );
};

export default DepartmentPortal;

