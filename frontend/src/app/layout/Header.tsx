// frontend/src/app/layout/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-2xl font-bold">АО «Металлург»</Link>
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-medium">{user.firstName} {user.lastName}</div>
              {user.department && (
                <Link
                  to={`/departments/${user.department.id}`}
                  className="text-sm text-gray-200 hover:underline"
                >
                  {user.department.name}
                </Link>
              )}
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-1 bg-green-500 rounded hover:bg-green-600"
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
