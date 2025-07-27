import React, { useState, useEffect } from "react";
import UserSection from "../features/users/UserSection";
import WikiSection from "../features/wiki/WikiSection";
import { useNavigate } from "react-router-dom";

type SectionType = "docs" | "profile" | "users" | "admin";

interface Department {
  id: number;
  name: string;
}

interface User {
  firstName: string;
  lastName: string;
  department: Department | null;
  role?: string | null;
}

interface MainPageProps {
  token: string;
  userRole: string | null;
  user: User | null;
  handleLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ token, userRole, user, handleLogout }) => {
  const [section, setSection] = useState<SectionType>("docs");
  const [departments, setDepartments] = useState<Department[]>([]);
  const navigate = useNavigate();

  // Загрузка списка департаментов для админа
  useEffect(() => {
    if (userRole === "admin") {
      fetch("http://localhost:3001/api/departments")
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Ошибка загрузки департаментов: ${res.status}`);
          }
          return res.json();
        })
        .then((data: Department[]) => setDepartments(data))
        .catch((err) => {
          console.error(err);
          setDepartments([]);
        });
    }
  }, [userRole]);

  const handleDepartmentClick = () => {
    if (user?.department) {
      navigate(`/department/${user.department.id}`);
    }
  };

  const handleSelectDepartment = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      navigate(`/department/${selectedId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-4 flex items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setSection("docs")}
            className={`px-3 py-2 rounded ${
              section === "docs" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            Документы
          </button>

          {userRole === "admin" && (
            <button
              onClick={() => setSection("users")}
              className={`px-3 py-2 rounded ${
                section === "users" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              Пользователи
            </button>
          )}

          <button
            onClick={() => setSection("profile")}
            className={`px-3 py-2 rounded ${
              section === "profile" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            Профиль
          </button>

          {userRole === "admin" && (
            <button
              onClick={() => setSection("admin")}
              className={`px-3 py-2 rounded ${
                section === "admin" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
              }`}
            >
              Админ-панель
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {user && (
            <>
              <div className="font-semibold">
                {user.firstName} {user.lastName}
              </div>

              {userRole === "admin" ? (
                <select
                  onChange={handleSelectDepartment}
                  defaultValue=""
                  className="border rounded px-2 py-1 cursor-pointer"
                  title="Выберите департамент"
                >
                  <option value="" disabled>
                    Выберите департамент
                  </option>
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              ) : user.department ? (
                <button
                  onClick={handleDepartmentClick}
                  className="text-blue-600 underline hover:text-blue-800 bg-transparent border-none cursor-pointer p-0"
                  title={`Перейти в отдел: ${user.department.name}`}
                >
                  {user.department.name}
                </button>
              ) : (
                <div className="text-gray-500 italic">Без отдела</div>
              )}
            </>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
          >
            Выйти
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        {section === "docs" && <WikiSection />}
        {section === "profile" && <UserSection type="profile" token={token} />}
        {section === "users" && userRole === "admin" && <UserSection type="userList" token={token} />}
        {section === "admin" && userRole === "admin" && <UserSection type="admin" token={token} />}
      </div>
    </div>
  );
};

export default MainPage;



