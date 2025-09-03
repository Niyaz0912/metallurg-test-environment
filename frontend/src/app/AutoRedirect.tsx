// frontend/src/app/AutoRedirect.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../features/auth/hooks/useAuth';

const AutoRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      console.log('🎯 Автоматическое перенаправление для пользователя:', user);
      
      // Админ → админ-панель
      if (user.role === 'admin') {
        console.log('👨‍💼 Перенаправление админа в админ-панель');
        navigate('/admin', { replace: true });
        return;
      }

      // Обычный пользователь → портал департамента
      if (user.department) {
        console.log('🏢 Перенаправление в портал департамента:', user.department.name);
        navigate(`/departments/${user.department.id}`, { replace: true });
        return;
      }

      // Fallback на главную страницу
      console.log('🏠 Перенаправление на главную страницу (fallback)');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Перенаправление...</div>
      </div>
    );
  }

  return null;
};

export default AutoRedirect;
