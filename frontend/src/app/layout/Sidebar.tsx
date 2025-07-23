import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onHomeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onHomeClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // По умолчанию свернут

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarClasses = [
    'fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-800 text-white transition-all duration-300 ease-in-out z-50',
    isOpen ? 'translate-x-0' : '-translate-x-full',
    isCollapsed ? 'w-12' : 'w-64',
    'lg:translate-x-0',
  ].join(' ');

  const contentClasses = [
    'transition-opacity duration-200 p-4',
    isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100',
  ].join(' ');

  return (
    <>
      {/* Основной сайдбар */}
      <div className={sidebarClasses}>
        {/* Кнопка сворачивания/разворачивания */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white w-6 h-12 rounded-r-lg flex items-center justify-center shadow-md hover:bg-gray-700 focus:outline-none"
          aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {isCollapsed ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>

        {/* Кнопка закрытия на мобильных */}
        {!isCollapsed && (
          <button 
            onClick={onClose} 
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Контент сайдбара */}
        <div className={contentClasses}>
          <nav className="mt-8">
            <ul>
              <li className="mb-2">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onHomeClick();
                  }} 
                  className={currentView === 'positions' ? 
                    'bg-blue-600 block px-4 py-2 rounded-md' : 
                    'hover:bg-gray-700 block px-4 py-2 rounded-md'
                  }
                >
                  Должности
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Мини-версия для свернутого состояния */}
        <div className="absolute inset-0 flex flex-col items-center pt-8 space-y-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              onHomeClick();
              if (isCollapsed) toggleCollapse();
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded-md group"
            title="Должности"
          >
            <svg 
              className="w-5 h-5 text-gray-300 group-hover:text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Оверлей для мобильных */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
    </>
  );
};

export default Sidebar;
