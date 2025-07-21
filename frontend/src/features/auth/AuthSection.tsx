import React from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

type AuthSectionProps = {
  onLogin: (token: string, role: string, departmentId: string) => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
};

const AuthSection: React.FC<AuthSectionProps> = ({
  onLogin,
  authMode,
  setAuthMode
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
        {authMode === "login" ? (
          <>
            <LoginForm onLogin={onLogin} />
            <div className="mt-4 text-center text-sm text-gray-500">
              Нет аккаунта?{" "}
              <button
                type="button"
                className="text-blue-500 hover:underline focus:outline-none"
                onClick={() => setAuthMode("register")}
              >
                Зарегистрироваться
              </button>
            </div>
          </>
        ) : (
          <>
            <RegisterForm
              onRegisterSuccess={(token: string, role: string, departmentId: string) => {
                onLogin(token, role, departmentId);
                setAuthMode("login");
              }}
            />
            <div className="mt-4 text-center text-sm text-gray-500">
              Уже есть аккаунт?{" "}
              <button
                type="button"
                className="text-blue-500 hover:underline focus:outline-none"
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
};

export default AuthSection;
