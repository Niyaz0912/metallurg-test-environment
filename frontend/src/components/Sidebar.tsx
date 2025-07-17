import React from 'react';
import { Home, Building, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'positions' | 'folders' | 'documents';
  onHomeClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentView,
  onHomeClick
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Навигация</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <button
              onClick={onHomeClick}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                currentView === 'positions'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Книжные полки</span>
            </button>

            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Информация
              </h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 text-sm">
                  <Building className="w-4 h-4" />
                  <span>Должности: 3</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 text-sm">
                  <span className="w-4 h-4 text-center">📁</span>
                  <span>Папок: 6</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 text-sm">
                  <span className="w-4 h-4 text-center">📄</span>
                  <span>Документов: 10</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Система управления<br />регламентами компании
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};