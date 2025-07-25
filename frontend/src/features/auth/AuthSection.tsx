import React from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

const AuthSection = ({ onLogin }: { onLogin: (token: string, data: any) => void }) => {
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
        {isLogin ? (
          <>
            <LoginForm onLogin={onLogin} />
            <div className="mt-4 text-center">
              Нет аккаунта?{' '}
              <button onClick={() => setIsLogin(false)} className="text-blue-500">
                Зарегистрироваться
              </button>
            </div>
          </>
        ) : (
          <>
            <RegisterForm 
              onRegisterSuccess={(token, data) => {
                onLogin(token, data);
                setIsLogin(true);
              }} 
            />
            <div className="mt-4 text-center">
              Уже есть аккаунт?{' '}
              <button onClick={() => setIsLogin(true)} className="text-blue-500">
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
