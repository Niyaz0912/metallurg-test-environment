import React from 'react';
import { DocumentFolder } from '../types';
import { ArrowLeft } from 'lucide-react';

interface FolderViewProps {
  folders: DocumentFolder[];
  positionName: string;
  onFolderClick: (folder: DocumentFolder) => void;
  onBackClick: () => void;
}

export const FolderView: React.FC<FolderViewProps> = ({ 
  folders, 
  positionName, 
  onFolderClick,
  onBackClick 
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBackClick}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к полкам</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Папки должности: {positionName}
        </h2>
        <p className="text-gray-600">
          Выберите папку для просмотра документов
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 p-8 hover:shadow-lg transition-all duration-300 cursor-pointer hover:from-gray-100 hover:to-gray-150 group"
            onClick={() => onFolderClick(folder)}
          >
            <div className="text-center">
              {/* Иконка папки */}
              <div className={`w-24 h-24 ${folder.color} rounded-lg flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {folder.type === 'employee' ? '👤' : '📋'}
              </div>

              {/* Название папки */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {folder.name}
              </h3>

              {/* Тип папки */}
              <p className="text-gray-600 mb-4">
                {folder.type === 'employee' 
                  ? 'Документы штатного сотрудника' 
                  : 'Документы должности'
                }
              </p>

              {/* Количество документов */}
              <div className="bg-white rounded-full px-4 py-2 inline-block shadow-sm">
                <span className="text-sm font-medium text-gray-700">
                  📄 {folder.documents.length} документов
                </span>
              </div>

              {/* Список документов (превью) */}
              <div className="mt-4 text-left">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs font-medium text-gray-500 mb-2">Содержимое:</p>
                  <ul className="space-y-1">
                    {folder.documents.slice(0, 3).map((doc) => (
                      <li key={doc.id} className="text-xs text-gray-600 flex items-center space-x-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span className="truncate">{doc.title}</span>
                      </li>
                    ))}
                    {folder.documents.length > 3 && (
                      <li className="text-xs text-gray-500 italic">
                        и еще {folder.documents.length - 3} документов...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Эффект наведения */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
};