// shared/api/
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Простые функции для запросов
  get: (url) => fetch(`${API_URL}${url}`).then(r => r.json()),
  post: (url, data) => fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())
};

// Теперь в компонентах просто:
// const users = await api.get('/users');
