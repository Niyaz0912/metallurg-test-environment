import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./layout/Header";

import UserSection from "../features/users/UserSection";
import WikiSection from "../features/wiki/WikiSection";
import ProductionPlanPage from '../features/productionPlans/ProductionPlanPage';

interface Department {
  id: number;
  name: string;
}

interface User {
  firstName: string;
  lastName: string;
  department: Department | null;
  role?: string | null;
}

interface MainPageProps {
  token: string;
  userRole: string | null;
  user: User | null;
  handleLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ token, userRole, user, handleLogout }) => {
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="*" element={<Navigate to="/documents" replace />} />
          <Route path="/documents" element={<WikiSection />} />
          <Route path="/profile" element={<UserSection type="profile" token={token} />} />
          <Route path="/production-plans" element={<ProductionPlanPage />} />

          {/* Другие маршруты */}
          <Route path="*" element={<Navigate to="/documents" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default MainPage;


