import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: string;
  onBackClick: (() => void) | undefined;
  breadcrumb: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, searchQuery, onSearchChange, currentView, onBackClick, breadcrumb }) => {
  return (
    <header className='bg-white shadow p-4 flex items-center justify-between'>
      <div className='flex items-center'>
        <button onClick={onMenuClick} className='lg:hidden text-gray-600 mr-4'>
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h16m-7 6h7'></path></svg>
        </button>
        {onBackClick && (
          <button onClick={onBackClick} className='text-gray-600 mr-4'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 19l-7-7m0 0l7-7m-7 7h18'></path></svg>
          </button>
        )}
        <h1 className='text-xl font-bold text-gray-800'>{breadcrumb || 'Библиотека регламентов'}</h1>
      </div>
      <input
        type='text'
        placeholder='Поиск...'
        className='px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </header>
  );
};

export default Header;
