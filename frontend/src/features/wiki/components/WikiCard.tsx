import { Calendar, User, Tag, Eye } from 'lucide-react';
import React from 'react';

import { WikiPage } from '../../../shared/types';

interface WikiCardProps {
  page: WikiPage;
  onClick: (page: WikiPage) => void;
}

export const WikiCard: React.FC<WikiCardProps> = ({ page, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликован';
      case 'draft':
        return 'Черновик';
      case 'archived':
        return 'Архив';
      default:
        return status;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
      onClick={() => onClick(page)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {page.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{page.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(page.updatedAt).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
          {getStatusText(page.status)}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {page.content.replace(/[#*]/g, '').substring(0, 150)}...
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Tag className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {page.tags.slice(0, 2).join(', ')}
              {page.tags.length > 2 && ` +${page.tags.length - 2}`}
            </span>
          </div>
        </div>
        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <Eye className="w-4 h-4" />
          <span>Читать</span>
        </button>
      </div>
    </div>
  );
};