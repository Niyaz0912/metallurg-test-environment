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
  };
}

interface Props {
  onLogin: (token: string, role: string) => void;
}

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
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
  // Добавляем timestamp для избежания кеширования
  const apiUrl = `http://127.0.0.1:3001/api/users/login?t=${Date.now()}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json' // Явно указываем, что ожидаем JSON
    },
    body: JSON.stringify({
      username: formData.username,
      password: formData.password
    }),
  });


      // Проверяем статус ответа перед анализом контента
      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Пробуем распарсить как JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.message || `Ошибка ${response.status}`);
        } catch {
          // Если не JSON, возвращаем как есть
          throw new Error(errorText || `Ошибка ${response.status}`);
        }
      }

      // Проверяем Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Сервер вернул данные в неожиданном формате');
      }

      const data: LoginResponse = await response.json();

      if (!data.token) {
        throw new Error(data.error || data.message || 'Токен не был получен');
      }

      onLogin(data.token, data.role || 'user');
      
    } catch (err) {
      let errorMessage = 'Ошибка при входе в систему';
      
      if (err instanceof Error) {
        // Обработка HTML/текстовых ошибок
        if (err.message.startsWith('<!DOCTYPE') || 
            err.message.startsWith('<html') ||
            err.message.includes('<!doctype html>')) {
          errorMessage = 'Сервер вернул HTML страницу. Проверьте:';
          errorMessage += '\n1. Правильность URL API';
          errorMessage += '\n2. Запущен ли сервер бэкенда';
          errorMessage += '\n3. Настройки CORS на сервере';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error('Ошибка входа:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Вход в систему</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md whitespace-pre-line">
          {error}
        </div>
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
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;