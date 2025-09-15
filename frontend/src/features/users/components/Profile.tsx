// frontend/src/features/users/components/Profile.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';

const Profile: React.FC = () => {
  const { user, loading } = useAuth();
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
      </div>
    </div>
  );
};

export default Profile;
