// frontend/src/features/users/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

interface ProfileProps {
  // Убираем все пропсы, используем контекст
}

const Profile: React.FC<ProfileProps> = () => {
  const { user, logout, loading } = useAuth();
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  if (loading) return <div>Загрузка профиля…</div>;
  if (!profile) return <div>Не авторизован</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Профиль</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-2"><strong>Имя:</strong> {profile.firstName}</p>
        <p className="mb-2"><strong>Фамилия:</strong> {profile.lastName}</p>
        <p className="mb-2"><strong>Роль:</strong> {profile.role}</p>
        <p className="mb-4"><strong>Департамент:</strong> {profile.department?.name || 'не указан'}</p>
        <button 
          onClick={logout} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default Profile;
