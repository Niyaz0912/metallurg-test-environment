// frontend/src/shared/api/users.ts
import { UserRole } from "../types/index.ts";

// ✅ ИСПРАВЛЕНО: убрана проблемная конфигурация с VITE_API_URL

// Общая функция для выполнения запросов с токеном
const request = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // ✅ ИСПРАВЛЕНО: используем относительные пути для работы через proxy
  const response = await fetch(url, { 
    ...options, 
    headers,
    credentials: 'include' // Добавлено для CORS
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
    const error = new Error(errorData.message || 'Ошибка сети');
    (error as any).response = response;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// ✅ API функции с относительными путями
export const updateUserRole = async (userId: number, newRole: UserRole, token: string) => {
  const response = await fetch(`/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ role: newRole })
  });
  
  if (!response.ok) throw new Error('Ошибка при обновлении роли');
  return await response.json();
};

export const fetchCurrentUserRole = async (token: string) => {
  const response = await fetch('/api/users/check-role', {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Ошибка при проверке роли');
  return await response.json();
};

export const updateUser = async (userId: number, userData: any, token: string) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка при обновлении пользователя');
  }
  return await response.json();
};

// ✅ ИСПРАВЛЕННЫЙ API объект
export const api = {
  get: (url: string) => request(url),
  post: (url: string, data: any) => request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url: string, data: any) => request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (url: string) => request(url, {
    method: 'DELETE'
  })
};
