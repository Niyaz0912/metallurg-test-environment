import React, { useState } from 'react';

interface LoginResponse {
  token?: string;
  role?: string;
  error?: string;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: {
      id: string;
    };
  };
}

interface Props {
  onLogin: (token: string, responseData: LoginResponse) => void; 
}

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  if (!formData.username || !formData.password) {
    setError('Все поля обязательны для заполнения');
    return;
  }

  setIsLoading(true);
  
  try {
    const response = await fetch("http://localhost:3001/api/users/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка входа');
    }

    const data = await response.json();
    
    if (!data.token) {
      throw new Error('Токен не получен');
    }

    onLogin(data.token, data);
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка при входе';
    setError(message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Вход в систему</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md whitespace-pre-line">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Логин
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="username"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="current-password"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;

