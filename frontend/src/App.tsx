import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PositionShelf } from './components/PositionShelf';
import { FolderView } from './components/FolderView';
import { WikiCard } from './components/WikiCard';
import { WikiModal } from './components/WikiModal';
import { positions } from './data/mockData';
import { Position, DocumentFolder, WikiPage } from './types';

import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Profile from './components/Profile';
import UserList from './components/UserList';
import AdminPanel from './components/AdminPanel';

type ViewType = 'positions' | 'folders' | 'documents';
type SectionType = 'docs' | 'profile' | 'users' | 'admin';
type AuthMode = 'login' | 'register';
type UserRole = 'employee' | 'master' | 'director' | 'admin' | null;

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState<UserRole>(localStorage.getItem('userRole') as UserRole || null);
  const [section, setSection] = useState<SectionType>('docs');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // ——— Бизнес состояния ↓ ниже не изменялись ———
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('positions');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Исправленный handleLogin: только токен!
  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
    // роль подтянется ниже через useEffect
  };

  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setSection('docs');
    setAuthMode('login');
  };

  // Корректно подтягиваем роль при изменении токена
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch('http://127.0.0.1:3001/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          const role = data.role || data.user?.role || null;
          if (!role || !['employee', 'master', 'director', 'admin'].includes(role)) {
            throw new Error(`Неизвестная роль: ${role}`);
          }
          setUserRole(role as UserRole);
          localStorage.setItem('userRole', role);
        } catch (err) {
          console.error('Ошибка проверки авторизации:', err);
          handleLogout();
        }
      }
    };
    checkAuth();
  }, [token]);

  // =========================
  // ФУНКЦИИ, КОТОРЫЕ НУЖНЫ ДЛЯ JSX!
  // =========================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPage(null);
  };

  const handleBackToPositions = () => {
    setCurrentView('positions');
    setSelectedPosition(null);
    setSelectedFolder(null);
    setSearchQuery('');
  };

  const handleBackToFolders = () => {
    setCurrentView('folders');
    setSelectedFolder(null);
    setSearchQuery('');
  };

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    setCurrentView('folders');
  };

  const handleFolderClick = (folder: DocumentFolder) => {
    setSelectedFolder(folder);
    setCurrentView('documents');
  };

  const handlePageClick = (page: WikiPage) => {
    setSelectedPage(page);
    setIsModalOpen(true);
  };

  const getBreadcrumb = () => {
    if (currentView === 'folders' && selectedPosition)
      return `${selectedPosition.name} → ${selectedPosition.department}`;
    if (currentView === 'documents' && selectedPosition && selectedFolder)
      return `${selectedPosition.name} → ${selectedFolder.name}`;
    return '';
  };

  const getBackHandler = () => {
    if (currentView === 'folders') return handleBackToPositions;
    if (currentView === 'documents') return handleBackToFolders;
    return undefined;
  };

  // Фильтрация документов
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

  // ============================
  // Рендеринг
  // ============================

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
          {authMode === 'login' ? (
            <>
              <LoginForm onLogin={handleLogin} />
              <div className="mt-4 text-center text-sm text-gray-500">
                Нет аккаунта?{' '}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setAuthMode('register')}
                >
                  Зарегистрироваться
                </button>
              </div>
            </>
          ) : (
            <>
              <RegisterForm onRegisterSuccess={() => setAuthMode('login')} />
              <div className="mt-4 text-center text-sm text-gray-500">
                Уже есть аккаунт?{' '}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setAuthMode('login')}
                >
                  Войти
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex gap-4 items-center p-4 bg-white mb-2 shadow-sm">
        <button
          onClick={() => setSection('docs')}
          className={section === 'docs' ? 'font-bold underline' : ''}
        >Документы</button>
        <button
          onClick={() => setSection('users')}
          className={section === 'users' ? 'font-bold underline' : ''}
        >Пользователи</button>
        <button
          onClick={() => setSection('profile')}
          className={section === 'profile' ? 'font-bold underline' : ''}
        >Профиль</button>
        {userRole === 'admin' && (
          <button
            onClick={() => setSection('admin')}
            className={section === 'admin' ? 'font-bold underline' : ''}
          >Админ-панель</button>
        )}
        <span className="ml-auto" />
        <button
          onClick={handleLogout}
          className="text-red-500"
        >Выйти</button>
      </nav>

      {section === 'profile' && <Profile token={token} />}
      {section === 'users' && <UserList token={token} />}
      {section === 'admin' && userRole === 'admin' && <AdminPanel token={token} />}
      {section === 'docs' && (
        <>
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentView={currentView}
            onBackClick={getBackHandler()}
            breadcrumb={getBreadcrumb()}
          />

          <div className="flex">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              currentView={currentView}
              onHomeClick={handleBackToPositions}
            />

            <main className="flex-1 p-6 lg:ml-0">
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
                    {positions.map((position) => (
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
                      {filteredDocuments.map((page) => (
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
          </div>
          <WikiModal
            page={selectedPage}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </>
      )}
    </div>
  );
}

export default App;


