import React, { useState, useEffect } from "react";
import WikiSection from "./components/WikiSection";
import UserSection from "./components/UserSection";
import AuthSection from "./components/AuthSection";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DepartmentPortal from "./components/DepartmentPortal";

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
        <button onClick={handleLogout} className="text-red-500">
          Выйти
        </button>
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

  // Эффект для перенаправления при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const departmentId = localStorage.getItem("departmentId");

    if (
      token &&
      departmentId &&
      !window.location.pathname.startsWith("/department/")
    ) {
      window.location.href = `/department/${departmentId}`;
    }
  }, []);

  const handleLogin = (token: string, role: string, departmentId: string) => {
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
};


  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("departmentId");
    setAuthMode("login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch("http://127.0.0.1:3001/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          const role = data.role || data.user?.role || null;
          if (!role || !["employee", "master", "director", "admin"].includes(role)) {
            throw new Error(`Неизвестная роль: ${role}`);
          }
          setUserRole(role as UserRole);
          localStorage.setItem("userRole", role);
        } catch (err) {
          console.error("Ошибка проверки авторизации:", err);
          handleLogout();
        }
      }
    };
    checkAuth();
    // eslint-disable-next-line
  }, [token]);

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
            <MainPage token={token} userRole={userRole} handleLogout={handleLogout} />
          }
        />
        <Route path="/department/:departmentId" element={<DepartmentPortal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

