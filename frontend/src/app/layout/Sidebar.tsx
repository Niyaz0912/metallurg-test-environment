import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onHomeClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onHomeClick }) => {
  // Тут формируем className на основе isOpen
  const classes = [
    'fixed inset-y-0 left-0 w-64 bg-gray-800 text-white p-4 transition-transform duration-300 ease-in-out z-50',
    isOpen ? 'translate-x-0' : '-translate-x-full',
    'lg:translate-x-0',
  ].join(' ');

  return (
    <div className={classes}>
      <button onClick={onClose} className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <nav className="mt-8">
        <ul>
          <li className="mb-2">
            <a href="#" onClick={onHomeClick} className={currentView === 'positions' ? 'bg-blue-600 block px-4 py-2 rounded-md' : 'hover:bg-gray-700 block px-4 py-2 rounded-md'}>
              Должности
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
