// src/app/MainPage.tsx
import React from "react";
import UserSection from "../features/users/UserSection";
import WikiSection from "../features/wiki/WikiSection";

type SectionType = "docs" | "profile" | "users" | "admin";

const MainPage = ({
  token,
  userRole,
  handleLogout
}: {
  token: string;
  userRole: string | null;
  handleLogout: () => void;
}) => {
  const [section, setSection] = React.useState<SectionType>("docs");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setSection("docs")}
            className={`px-3 py-2 rounded ${section === "docs" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
          >
            Документы
          </button>
          <button
            onClick={() => setSection("users")}
            className={`px-3 py-2 rounded ${section === "users" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
          >
            Пользователи
          </button>
          <button
            onClick={() => setSection("profile")}
            className={`px-3 py-2 rounded ${section === "profile" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
          >
            Профиль
          </button>
          
          {userRole === "admin" && (
            <button
              onClick={() => setSection("admin")}
              className={`px-3 py-2 rounded ${section === "admin" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}
            >
              Админ-панель
            </button>
          )}

          <button 
            onClick={handleLogout}
            className="ml-auto px-3 py-2 text-red-600 hover:bg-red-50 rounded"
          >
            Выйти
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        {section === "docs" && <WikiSection />}
        {section === "profile" && <UserSection type="profile" token={token} />}
        {section === "users" && <UserSection type="userList" token={token} />}
        {section === "admin" && userRole === "admin" && (
          <UserSection type="admin" token={token} />
        )}
      </div>
    </div>
  );
};

export default MainPage;