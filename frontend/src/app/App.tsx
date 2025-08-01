import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthSection from "../features/auth/AuthSection";
import MainPage from "./MainPage";
import { DepartmentPortal } from '../features/departments/DepartmentPortal';

import { AssignmentList, AssignmentForm } from "../features/assignments";
import { ProductionPlanList, ProductionPlanForm } from "../features/productionPlans";
import { TaskList, TaskForm } from "../features/tasks";
import { TechCardList, TechCardForm } from "../features/techCard";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem("userRole"));

  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    department: { id: number; name: string } | null;
    role?: string | null;
  } | null>(null);

  const handleLogin = useCallback((token: string, responseData: any) => {
    if (!token || !responseData?.user?.role) {
      console.error('Invalid login response');
      return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", responseData.user.role);
    setToken(token);
    setUserRole(responseData.user.role);

    setUser({
      firstName: responseData.user.firstName,
      lastName: responseData.user.lastName,
      department: responseData.user.departmentId ? {
        id: responseData.user.departmentId,
        name: responseData.user.departmentName || `Отдел ${responseData.user.departmentId}`
      } : null,
      role: responseData.user.role,
    });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserRole(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/users/me", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Auth check failed');
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.role && data.role !== userRole) {
          setUserRole(data.role);
          localStorage.setItem("userRole", data.role);
        }

        setUser({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          department: data.user.department || null,
          role: data.user.role,
        });
      } catch (error) {
        handleLogout();
      }
    };

    checkAuth();

    return () => { isMounted = false; };
  }, [token, userRole, handleLogout]);

  if (!token) {
    return <AuthSection onLogin={handleLogin} />;
  }

  if (token && !user) {
    return <div>Загрузка данных пользователя...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={
          <MainPage
            token={token}
            userRole={userRole}
            user={user}
            handleLogout={handleLogout}
          />
        } />

        <Route
          path="/department/:departmentId"
          element={token ? <DepartmentPortal user={user} /> : <Navigate to="/" replace />}
        />

        <Route path="/assignments" element={token ? <AssignmentList /> : <Navigate to="/" replace />} />
        <Route path="/assignments/new" element={token ? <AssignmentForm /> : <Navigate to="/" replace />} />

        <Route path="/production-plans/new" element={token ? <ProductionPlanForm /> : <Navigate to="/" replace />} />

        <Route path="/tasks" element={token ? <TaskList /> : <Navigate to="/" replace />} />
        <Route path="/tasks/new" element={token ? <TaskForm /> : <Navigate to="/" replace />} />

        <Route path="/tech-cards" element={token ? <TechCardList /> : <Navigate to="/" replace />} />
        <Route path="/tech-cards/new" element={token ? <TechCardForm /> : <Navigate to="/" replace />} />

        <Route path="*" element={
          <MainPage
            token={token}
            userRole={userRole}
            user={user}
            handleLogout={handleLogout}
          />
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;


