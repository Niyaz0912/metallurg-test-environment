import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthSection from "../features/auth/AuthSection";
import UserSection from "../features/users/UserSection";
import WikiSection from "../features/wiki/WikiSection";
import DepartmentPortal from "../features/departments/DepartmentPortal";
import { DepartmentSwitcher } from "../features/departments/components/DepartmentSwitcher";

type SectionType = "docs" | "profile" | "users" | "admin";
type AuthMode = "login" | "register";
type UserRole = "employee" | "master" | "director" | "admin" | null;

function MainPage({
  token,
  userRole,
  handleLogout,
}: {
  token: string;
  userRole: UserRole;
  handleLogout: () => void;
}) {
  const [section, setSection] = React.useState<SectionType>("docs");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex gap-4 items-center p-4 bg-white mb-2 shadow-sm">
        <button
          onClick={() => setSection("docs")}
          className={section === "docs" ? "font-bold underline" : ""}
        >
          Документы
        </button>
        <button
          onClick={() => setSection("users")}
          className={section === "users" ? "font-bold underline" : ""}
        >
          Пользователи
        </button>
        <button
          onClick={() => setSection("profile")}
          className={section === "profile" ? "font-bold underline" : ""}
        >
          Профиль
        </button>
        {userRole === "admin" && (
          <button
            onClick={() => setSection("admin")}
            className={section === "admin" ? "font-bold underline" : ""}
          >
            Админ-панель
          </button>
        )}
        <span className="ml-auto" />
        <DepartmentSwitcher/>
      </nav>

      {/* Секции */}
      {section === "docs" && <WikiSection />}
      {section === "profile" && <UserSection type="profile" token={token} />}
      {section === "users" && <UserSection type="userList" token={token} />}
      {section === "admin" && userRole === "admin" && (
        <UserSection type="admin" token={token} />
      )}
    </div>
  );
}
function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [userRole, setUserRole] = useState<UserRole>(
    (localStorage.getItem("userRole") as UserRole) || null
  );
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const handleLogin = useCallback((token: string, role: string, departmentId: string) => {
    const depId = departmentId || '0';
    setToken(token);
    setUserRole(role as UserRole);
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("departmentId", depId);

    if (role === 'admin') {
      window.location.href = '/';
    } else {
      window.location.href = `/department/${depId}`;
    }
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("departmentId");
    setAuthMode("login");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const checkAuth = async () => {
      if (!token) return;
      if (isCheckingAuth) return;

      setIsCheckingAuth(true);
      
      try {
        const response = await fetch("http://localhost:3000/api/users/me", {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include', // Для куков, если используете
          signal
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const role = data.role || data.user?.role || null;
        
        if (!role || !["employee", "master", "director", "admin"].includes(role)) {
          throw new Error(`Неизвестная роль: ${role}`);
        }

        setUserRole(role as UserRole);
        localStorage.setItem("userRole", role);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError') {
            console.error("Auth check error:", err.message);
            handleLogout();
          }
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      controller.abort();
    };
  }, [token, handleLogout, isCheckingAuth]);

  // Добавляем перехватчик для 401 ошибки
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let response = await originalFetch(...args);
      if (response.status === 401) {
        handleLogout();
        return response;
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [handleLogout]);

  if (!token) {
    return (
      <AuthSection onLogin={handleLogin} authMode={authMode} setAuthMode={setAuthMode} />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainPage 
              token={token as string}
              userRole={userRole} 
              handleLogout={handleLogout} 
            />
          }
        />
        <Route path="/department/:departmentId" element={<DepartmentPortal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;