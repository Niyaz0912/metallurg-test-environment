// frontend/src/features/auth/AuthSection.tsx
import React from 'react';

import LoginForm from '../components/LoginForm';

interface AuthSectionProps {
  onLogin: (token: string) => Promise<void>;
}

const AuthSection: React.FC<AuthSectionProps> = ({ onLogin }) => {
  const handleLogin = async (token: string) => {
    console.log('🎯 AuthSection: передаем токен в AuthContext:', token);
    await onLogin(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );
};

export default AuthSection;

