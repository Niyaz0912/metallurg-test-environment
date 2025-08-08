// frontend/src/app/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './layout/Header';
import SubHeader from './layout/SubHeader';
import MainPage from './MainPage';
import AuthSection from '../features/auth/AuthSection';
import ProductionPlansPage from '../features/productionPlans/ProductionPlanPage';
import Profile from '../features/users/components/Profile';
import WikiSection from '../features/wiki/WikiSection';
import TechCardsPage from '../features/techCard/TechCardsPage';
import DepartmentPortal from '../features/departments/DepartmentPortal';
import AdminPanel from '../features/users/AdminPanel';
import PrivateRoute from './PrivateRoute';
import AutoRedirect from './AutoRedirect';
import { useAuth } from '../features/auth/hooks/useAuth';
import AssignmentsPage from '../features/assignments/AssignmentsPage';

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
    <Router>
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
    </Router>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
