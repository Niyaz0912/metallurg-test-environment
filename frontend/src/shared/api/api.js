// VITE_API_URL должен быть базовым URL, например: https://my-app.up.railway.app
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Используем конструктор URL для безопасного соединения частей адреса.
const createApiUrl = (path) => new URL(path, API_URL).toString();

// Общая функция для выполнения запросов с добавлением токена
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(createApiUrl(url), { ...options, headers });

  if (!response.ok) {
    // Попытка прочитать тело ошибки для более детальной информации
    const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
    // Создаем кастомную ошибку с сообщением от сервера
    const error = new Error(errorData.message || 'Ошибка сети');
    error.response = response; // Сохраняем полный ответ для дальнейшей отладки
    throw error;
  }

  // Для DELETE и других методов, которые могут не возвращать тело
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  get: (url) => request(url),
  post: (url, data) => request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url, data) => request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (url) => request(url, {
    method: 'DELETE'
  })
};
