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
  // Добавьте, если есть другие поля
};

type Assignment = {
  id: number;
  title: string;
  description?: string;
  dueDate?: string; // если есть
  status?: string; // статус задания, если есть
  // добавьте нужные поля, которые возвращает backend
};

export default function Profile({ token }: ProfileProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorUser, setErrorUser] = useState("");
  const [errorAssignments, setErrorAssignments] = useState("");

  useEffect(() => {
    setLoadingUser(true);
    fetch("http://127.0.0.1:3001/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Нет доступа к данным профиля");
        return res.json();
      })
      .then((data) => {
        setUser(data.user || data);
        setErrorUser("");
      })
      .catch((err) => setErrorUser(err.message))
      .finally(() => setLoadingUser(false));
  }, [token]);

  useEffect(() => {
    setLoadingAssignments(true);
    fetch("http://127.0.0.1:3001/api/assignments", { // поменяйте URL на реальный API сменных заданий
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не удалось загрузить сменные задания");
        return res.json();
      })
      .then((data) => {
        setAssignments(data.assignments || data); // адаптируйте в зависимости от структуры
        setErrorAssignments("");
      })
      .catch((err) => setErrorAssignments(err.message))
      .finally(() => setLoadingAssignments(false));
  }, [token]);

  if (loadingUser) return <div className="p-8">Загрузка профиля...</div>;
  if (errorUser) return <div className="text-red-600">{errorUser}</div>;
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

      {/* Карточки сменных заданий */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Сменные задания</h3>
        {loadingAssignments && <div>Загрузка заданий...</div>}
        {errorAssignments && <div className="text-red-600">{errorAssignments}</div>}
        {!loadingAssignments && !errorAssignments && (
          <>
            {assignments.length === 0 ? (
              <div>Задания отсутствуют</div>
            ) : (
              <ul className="space-y-4">
                {assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="border p-4 rounded shadow-sm hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-lg">{assignment.title}</h4>
                    {assignment.description && <p className="text-gray-700">{assignment.description}</p>}
                    {assignment.dueDate && (
                      <p className="text-sm text-gray-500">
                        Срок выполнения: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {assignment.status && <p className="text-sm font-medium">Статус: {assignment.status}</p>}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Изменить пароль
        </button>
        {/* Здесь можно сделать также редактирование email */}
        {/* <button className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Редактировать профиль
        </button> */}
      </div>
    </div>
  );
}
