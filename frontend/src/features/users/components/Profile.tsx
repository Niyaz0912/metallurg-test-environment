import React, { useEffect, useState } from "react";

type ProfileProps = {
  token: string;
};

type UserInfo = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  // Добавь тут всё, что отдаёт твой backend
};

export default function Profile({ token }: ProfileProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:3001/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Нет доступа к данным профиля");
        return res.json();
      })
      .then((data) => {
        setUser(data.user || data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8">Загрузка профиля...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!user) return <div>Нет данных пользователя</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Профиль пользователя</h2>
      <div className="mb-4">
        <span className="text-gray-600 font-semibold">ID:</span> {user.id}
      </div>
      <div className="mb-4">
        <span className="text-gray-600 font-semibold">Логин:</span> {user.username}
      </div>
      <div className="mb-4">
        <span className="text-gray-600 font-semibold">E-mail:</span> {user.email}
      </div>
      <div className="mb-4">
        <span className="text-gray-600 font-semibold">Роль:</span> {user.role}
      </div>
      {user.createdAt && (
        <div className="mb-4">
          <span className="text-gray-600 font-semibold">Зарегистрирован:</span>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )}
      <div className="flex gap-4 mt-8">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Изменить пароль
        </button>
        {/* Здесь можно сделать также редактирование email */}
        {/* <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Редактировать профиль
        </button> */}
      </div>
      {/* Опционально: */}
      {/* <div className="mt-8 text-sm text-gray-400 break-all">Ваш токен: {token}</div> */}
    </div>
  );
}

