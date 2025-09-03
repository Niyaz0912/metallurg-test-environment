import React from 'react';

import { Position } from '../../shared/types';

interface PositionShelfProps {
  position: Position;
  onClick: (position: Position) => void;
}

const iconMap = {
  Users: '👥',
  DollarSign: '💰',
  Shield: '🛡️',
  Settings: '⚙️'
};

export const PositionShelf: React.FC<PositionShelfProps> = ({ position, onClick }) => {
  return (
    <div 
      className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:from-amber-100 hover:to-amber-150 group"
      onClick={() => onClick(position)}
    >
      {/* Книжная полка - деревянная текстура */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 rounded-lg opacity-20"></div>
      
      {/* Тень полки */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-30 rounded-b-lg"></div>
      
      <div className="relative z-10">
        {/* Заголовок полки */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${position.color} rounded-lg flex items-center justify-center text-white text-lg shadow-md`}>
              {iconMap[position.icon as keyof typeof iconMap] || '📋'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{position.name}</h3>
              <p className="text-sm text-gray-600">{position.department}</p>
            </div>
          </div>
          <div className="text-2xl group-hover:scale-110 transition-transform">📚</div>
        </div>

        {/* Папки на полке */}
        <div className="flex space-x-3 justify-center">
          {position.folders.map((folder, index) => (
            <div
              key={folder.id}
              className={`w-16 h-20 ${folder.color} rounded-t-lg shadow-md flex flex-col items-center justify-center text-white transform hover:scale-105 transition-transform`}
              style={{
                transform: `rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`,
              }}
            >
              <div className="text-lg mb-1">
                {folder.type === 'employee' ? '👤' : '📋'}
              </div>
              <div className="text-xs text-center font-medium leading-tight">
                {folder.type === 'employee' ? 'Сотрудник' : 'Должность'}
              </div>
            </div>
          ))}
        </div>

        {/* Информация о содержимом */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {position.folders.reduce((total, folder) => total + folder.documents.length, 0)} документов
          </p>
        </div>
      </div>

      {/* Эффект наведения */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};