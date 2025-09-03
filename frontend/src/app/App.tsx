// frontend/src/app/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AssignmentsPage from '../features/assignments/pages/AssignmentsPage';
import { useAuth } from '../features/auth/hooks/useAuth';
import AuthSection from '../features/auth/pages/AuthSection';
import DepartmentPortal from '../features/departments/pages/DepartmentPortal';
import ProductionPlansPage from '../features/productionPlans/pages/ProductionPlanPage';
import TechCardsPage from '../features/techCard/pages/TechCardsPage';
import Profile from '../features/users/components/Profile';
import AdminPanel from '../features/users/pages/AdminPanel';
import WikiSection from '../features/wiki/pages/WikiSection';

import AutoRedirect from './AutoRedirect';
import Header from './layout/Header';
import SubHeader from './layout/SubHeader';
import MainPage from './MainPage';

import PrivateRoute from './PrivateRoute';


const AppContent: React.FC = () => {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header всегда виден */}
      <Header />

      {/* SubHeader показываем только если авторизованы */}
      {user && <SubHeader />}

      <main className="flex-1 bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <Routes>
            {/* Страница логина */}
            <Route 
              path="/login" 
              element={<AuthSection onLogin={login} />} 
            />

            {/* Приватные маршруты */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Routes>
                    {/* Автоматическое перенаправление с главной */}
                    <Route path="/" element={<AutoRedirect />} />
                    
                    {/* Админ-панель (только для админов) */}
                    <Route 
                      path="/admin" 
                      element={
                        user?.role === 'admin' ? (
                          <AdminPanel />
                        ) : (
                          <Navigate to="/" replace />
                        )
                      } 
                    />
                    
                    {/* Порталы департаментов */}
                    <Route 
                      path="/departments/:departmentId" 
                      element={<DepartmentPortal />} 
                    />
                    
                    {/* Остальные страницы */}
                    <Route path="/documents" element={<WikiSection />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/production-plans" element={<ProductionPlansPage />} />
                    <Route path="/assignments" element={<AssignmentsPage />} />
                    <Route path="/techcards" element={<TechCardsPage />} />
                    
                    {/* Fallback - главная страница */}
                    <Route path="/main" element={<MainPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
