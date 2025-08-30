// VITE_API_URL должен быть базовым URL, например: https://my-app.up.railway.app
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Используем конструктор URL для безопасного соединения частей адреса.
// Это решает проблему с двойными слэшами или дублированием /api.
const createApiUrl = (path) => new URL(path, API_URL).toString();

export const api = {
  get: (url) => fetch(createApiUrl(url)).then(r => r.json()),
  post: (url, data) => fetch(createApiUrl(url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())
};
