// frontend/src/components/WikiSection.tsx

import React, { useState, useMemo } from 'react';

import Sidebar from '../../../app/layout/Sidebar';
import { FolderView } from '../../../common/components/FolderView';
import { PositionShelf } from '../../../common/components/PositionShelf';
import { positions } from '../../../data/mockData';
import { Position, DocumentFolder, WikiPage } from '../../../shared/types';

import { WikiCard } from '../components/WikiCard';
import { WikiModal } from '../components/WikiModal';


type ViewType = 'positions' | 'folders' | 'documents';

const WikiSection: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('positions');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDocuments = useMemo(() => {
    if (!selectedFolder || !searchQuery.trim()) {
      return selectedFolder?.documents || [];
    }
    const query = searchQuery.toLowerCase();
    return selectedFolder.documents.filter(doc =>
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [selectedFolder, searchQuery]);

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    setCurrentView('folders');
  };

  const handleFolderClick = (folder: DocumentFolder) => {
    setSelectedFolder(folder);
    setCurrentView('documents');
  };

  const handleBackToPositions = () => {
    setCurrentView('positions');
    setSelectedPosition(null);
    setSelectedFolder(null);
    setSearchQuery('');
  };

  const handlePageClick = (page: WikiPage) => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentView={currentView}
        onHomeClick={handleBackToPositions}
      />

      <main className="flex-1 p-6">
        {/* Книжные полки */}
        {currentView === 'positions' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Книжные полки регламентов
              </h2>
              <p className="text-gray-600">
                Выберите должность для просмотра документов
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map(position => (
                <PositionShelf
                  key={position.id}
                  position={position}
                  onClick={handlePositionClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Папки */}
        {currentView === 'folders' && selectedPosition && (
          <FolderView
            folders={selectedPosition.folders}
            positionName={selectedPosition.name}
            onFolderClick={handleFolderClick}
            onBackClick={handleBackToPositions}
          />
        )}

        {/* Документы */}
        {currentView === 'documents' && selectedFolder && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedFolder.name}
              </h2>
              <p className="text-gray-600">
                {searchQuery
                  ? `Найдено ${filteredDocuments.length} документов по запросу "${searchQuery}"`
                  : `${filteredDocuments.length} документов доступно`
                }
              </p>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-gray-400">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Ничего не найдено' : 'Нет документов'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'В этой папке пока нет документов'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map(page => (
                  <WikiCard
                    key={page.id}
                    page={page}
                    onClick={handlePageClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <WikiModal
        page={selectedPage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default WikiSection;

