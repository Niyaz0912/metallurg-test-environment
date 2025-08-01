import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

interface User {
  firstName: string;
  lastName: string;
  department?: { id: number; name: string } | null;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow p-4 flex items-center justify-between">
      <nav className="flex items-center space-x-6">
        <NavLink 
          to="/documents" 
          className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}
          onClick={() => setMenuOpen(false)}
        >
          Документы
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}
          onClick={() => setMenuOpen(false)}
        >
          Профиль
        </NavLink>
        <NavLink 
          to="/production-plans" 
          className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}
          onClick={() => setMenuOpen(false)}
        >
          План производства
        </NavLink>
      </nav>

      <div className="flex items-center space-x-4">
        {user && (
          <>
            <div className="text-gray-700 font-medium flex items-center space-x-2">
              <span>{user.firstName} {user.lastName}</span>
              {user.department ? (
                <Link
                  to={`/department/${user.department.id}`}
                  className="text-blue-600 underline hover:text-blue-800"
                  title={`Перейти в отдел: ${user.department.name}`}
                >
                  ({user.department.name})
                </Link>
              ) : null}
            </div>
            <button 
              onClick={onLogout} 
              className="text-red-600 hover:text-red-800 border border-red-600 rounded px-3 py-1 text-sm"
              title="Выйти"
            >
              Выйти
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

