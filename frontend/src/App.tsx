import React, { useState, useEffect } from "react";
import WikiSection from "./components/WikiSection";
import UserSection from "./components/UserSection";
import AuthSection from "./components/AuthSection";

// Типы
type SectionType = "docs" | "profile" | "users" | "admin";
type AuthMode = "login" | "register";
type UserRole = "employee" | "master" | "director" | "admin" | null;

function App() {
  // Авторизационные состояния
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [userRole, setUserRole] = useState<UserRole>(
    (localStorage.getItem("userRole") as UserRole) || null
  );
  const [section, setSection] = useState<SectionType>("docs");
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Вход
  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
  };

  // Выход
  const handleLogout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    setSection("docs");
    setAuthMode("login");
  };

  // Запрос роли пользователя по токену
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

  // Если не авторизован — форма входа/регистрации
  if (!token) {
    return (
      <AuthSection
        onLogin={handleLogin}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
    );
  }

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

export default App;



