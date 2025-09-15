// frontend/src/features/auth/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  position?: string;
  departmentId?: number;
  department: {
    id: number;
    name: string;
  } | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔍 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ: Определение маршрута
  const getRedirectPath = (user: User): string => {
    console.log('🎯 === НАЧАЛО ОПРЕДЕЛЕНИЯ МАРШРУТА ===');
    console.log('📊 Полные данные пользователя:', JSON.stringify(user, null, 2));
    console.log('🔍 user.role:', user.role);
    console.log('🔍 user.departmentId:', user.departmentId);
    console.log('🔍 user.department:', user.department);
    
    let redirectPath = '/techcards'; // Значение по умолчанию
    
    switch (user.role) {
      case 'admin':
      case 'master':
        redirectPath = '/admin';
        console.log('🔧 Определен как админ/мастер -> /admin');
        break;
      
      case 'director':
        redirectPath = '/dashboard';
        console.log('👔 Определен как директор -> /dashboard');
        break;
      
      case 'employee':
      default:
        console.log('👨‍💼 Определен как сотрудник');
        if (user.departmentId) {
          redirectPath = `/departments/${user.departmentId}`;
          console.log(`🏢 У сотрудника есть departmentId: ${user.departmentId}`);
          console.log(`🏢 Сформирован путь департамента: ${redirectPath}`);
        } else {
          redirectPath = '/techcards';
          console.log('❌ У сотрудника НЕТ departmentId -> /techcards');
        }
        break;
    }
    
    console.log('✅ ИТОГОВЫЙ ПУТЬ РЕДИРЕКТА:', redirectPath);
    console.log('🎯 === КОНЕЦ ОПРЕДЕЛЕНИЯ МАРШРУТА ===');
    return redirectPath;
  };

  const fetchUserData = async (shouldRedirect: boolean = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ Токен отсутствует в localStorage');
        setLoading(false);
        return null;
      }
  
      console.log('🔄 === НАЧАЛО ЗАГРУЗКИ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ===');
      console.log('🔑 Токен найден:', token.substring(0, 20) + '...');
      console.log('🚀 shouldRedirect:', shouldRedirect);
      
      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('📝 Ответ сервера:', response.status, response.statusText);
  
      if (response.ok) {
        const data = await response.json();
        console.log('✅ RAW данные от сервера:', JSON.stringify(data, null, 2));
        
        // ИСПРАВЛЕНИЕ: сервер теперь возвращает данные напрямую
        if (data.id) { // ← Изменено с data.user на data.id
          const userData = {
            id: data.id,           // ← Изменено с data.user.id на data.id
            firstName: data.firstName,     // ← Изменено с data.user.firstName
            lastName: data.lastName,       // ← Изменено с data.user.lastName
            role: data.role,               // ← Изменено с data.user.role
            position: data.position,       // ← Изменено с data.user.position
            departmentId: data.departmentId, // ← Изменено с data.user.departmentId
            department: data.department      // ← Изменено с data.user.department
          };
          
          console.log('📋 Обработанные данные пользователя:', JSON.stringify(userData, null, 2));
          setUser(userData);
          console.log('✅ Пользователь установлен в состояние');
  
          // Редирект логика остается без изменений
          if (shouldRedirect) {
            console.log('🚀 === НАЧАЛО ПРОЦЕССА РЕДИРЕКТА ===');
            console.log('⏰ Текущий URL:', window.location.href);
            
            const redirectPath = getRedirectPath(userData);
            
            console.log('🎯 Пытаемся перейти на:', redirectPath);
            console.log('🔄 Вызываем navigate...');
            
            setTimeout(() => {
              console.log('⏳ Выполняем navigate через setTimeout');
              navigate(redirectPath);
              
              setTimeout(() => {
                console.log('📍 URL после navigate:', window.location.href);
                console.log('🚀 === КОНЕЦ ПРОЦЕССА РЕДИРЕКТА ===');
              }, 1000);
            }, 100);
          }
  
          console.log('🔄 === КОНЕЦ ЗАГРУЗКИ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ===');
          return userData;
        } else {
          console.error('❌ В ответе сервера отсутствует id пользователя');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Ошибка получения данных:', response.status, errorText);
        localStorage.removeItem('token');
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('❌ Ошибка запроса:', error);
      localStorage.removeItem('token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };
  

  // useEffect для проверки токена при загрузке (без редиректа)
  useEffect(() => {
    console.log('🚀 useEffect: Проверка авторизации при загрузке');
    const checkAuth = async () => {
      await fetchUserData(false); // Не редиректим при автологине
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Функция login с автоматическим редиректом
  const login = async (token: string) => {
    try {
      console.log('🔐 === НАЧАЛО ПРОЦЕССА ЛОГИНА ===');
      console.log('🔑 Получен токен для логина:', token.substring(0, 20) + '...');
      
      setLoading(true);
      localStorage.setItem('token', token);
      console.log('💾 Токен сохранен в localStorage');
      
      // Получаем данные пользователя и сразу редиректим
      console.log('📡 Загружаем данные пользователя с редиректом...');
      await fetchUserData(true);
      
      
      console.log('🔐 === КОНЕЦ ПРОЦЕССА ЛОГИНА ===');
    } catch (error) {
      console.error('❌ Ошибка авторизации:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  };

  // Функция logout с редиректом на страницу входа
  const logout = () => {
    console.log('👋 === НАЧАЛО ВЫХОДА ===');
    console.log('🗑️ Удаляем токен из localStorage');
    localStorage.removeItem('token');
    setUser(null);
    console.log('🚪 Редирект на /login');
    navigate('/login');
    console.log('👋 === КОНЕЦ ВЫХОДА ===');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !loading,
    login,
    logout,
    loading
  };

  console.log('🔍 AuthContext состояние:', { 
    user: user ? { 
      id: user.id, 
      role: user.role, 
      departmentId: user.departmentId,
      department: user.department?.name 
    } : null, 
    loading, 
    isAuthenticated: !!user && !loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
};


