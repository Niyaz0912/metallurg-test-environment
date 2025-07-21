// frontend/src/components/AuthSection.tsx

import React from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

// Обновлённая сигнатура onLogin: token, role, departmentId
type AuthSectionProps = {
  onLogin: (token: string, role: string, departmentId: string) => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
};

const AuthSection: React.FC<AuthSectionProps> = ({ onLogin, authMode, setAuthMode }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
      {authMode === "login" ? (
        <>
          <LoginForm onLogin={onLogin} />
          <div className="mt-4 text-center text-sm text-gray-500">
            Нет аккаунта?{" "}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setAuthMode("register")}
            >
              Зарегистрироваться
            </button>
          </div>
        </>
      ) : (
        <>
          <RegisterForm onRegisterSuccess={() => setAuthMode("login")} />
          <div className="mt-4 text-center text-sm text-gray-500">
            Уже есть аккаунт?{" "}
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setAuthMode("login")}
            >
              Войти
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);

export default AuthSection;

