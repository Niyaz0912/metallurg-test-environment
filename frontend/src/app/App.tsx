import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthSection from "../features/auth/AuthSection";
import MainPage from "./MainPage";
import { DepartmentPortal } from '../features/departments/DepartmentPortal';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("authToken"));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem("userRole"));
  
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    department: { id: number; name: string } | null;
  } | null>(null);

  const handleLogin = useCallback((token: string, responseData: any) => {
    console.log('Login response:', responseData); // Логирование данных входа
    if (!token || !responseData?.user?.role) {
      console.error('Invalid login response');
      return;
    }

    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", responseData.user.role);
    setToken(token);
    setUserRole(responseData.user.role);
    
    // Устанавливаем данные пользователя сразу после входа
    setUser({
      firstName: responseData.user.firstName,
      lastName: responseData.user.lastName,
      department: responseData.user?.department 
  ? { 
      id: responseData.user.department.id, 
      name: responseData.user.department.name 
    }
  : null,
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
        console.log('Checking auth with token:', token); // Логирование токена
        const response = await fetch("http://localhost:3001/api/users/me", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          console.error('Auth check failed with status:', response.status);
          throw new Error('Auth check failed');
        }

        const data = await response.json();
        console.log('User data received:', data); // Логирование данных пользователя

        if (!isMounted) return;

        if (data.role && data.role !== userRole) {
          setUserRole(data.role);
          localStorage.setItem("userRole", data.role);
        }

        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department || null,
        });
      } catch (error) {
        console.error('Auth check error:', error);
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
    <Route path="/" element={
      <MainPage
        token={token}
        userRole={userRole}
        user={user}
        handleLogout={handleLogout}
      />
    } />
    
    {/* Явно указываем, что DepartmentPortal требует аутентификации */}
    <Route 
      path="/department/:departmentId" 
      element={
        token ? <DepartmentPortal /> : <Navigate to="/" replace />
      }
    />
    
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
  );
}

export default App;

