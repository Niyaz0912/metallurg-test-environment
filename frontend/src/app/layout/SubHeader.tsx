// frontend/src/app/layout/SubHeader.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

const SubHeader: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-8">
          {/* Портал департамента / Админ-панель */}
          {user?.role === 'admin' ? (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive || location.pathname.startsWith('/admin')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-2 inline-block'
                    : 'text-gray-600 hover:text-blue-600 pb-2 inline-block'
                }
              >
                🔧 Админ-панель
              </NavLink>
            </li>
          ) : user?.department ? (
            <li>
              <NavLink
                to={`/departments/${user.department.id}`}
                className={({ isActive }) =>
                  isActive || location.pathname.startsWith('/departments')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-2 inline-block'
                    : 'text-gray-600 hover:text-blue-600 pb-2 inline-block'
                }
              >
                🏢 {user.department.name}
              </NavLink>
            </li>
          ) : null}

          <li>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-2 inline-block'
                  : 'text-gray-600 hover:text-blue-600 pb-2 inline-block'
              }
            >
              📄 Документы
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-2 inline-block'
                  : 'text-gray-600 hover:text-blue-600 pb-2 inline-block'
              }
            >
              👤 Профиль
            </NavLink>
          </li>
          
          <li>
            <NavLink
              to="/production-plans"
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-2 inline-block'
                  : 'text-gray-600 hover:text-blue-600 pb-2 inline-block'
              }
            >
              📊 Планы производства
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SubHeader;

