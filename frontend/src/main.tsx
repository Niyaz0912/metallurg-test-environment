// frontend/src/main.tsx
// Cache-busting comment: 1
alert('ЗАГРУЖЕНА НОВАЯ ВЕРСИЯ КОДА!');
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 🆕
import { AuthProvider } from './features/auth/context/AuthContext';
import App from './app/App';
import './app/index.css';

// 🆕 Создаем "почтовое отделение" для React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}> {/* 🆕 Оборачиваем */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);


