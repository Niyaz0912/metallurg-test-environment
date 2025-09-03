// frontend/src/components/UserSection.tsx

import React from "react";

import AdminPanel from "./AdminPanel";
import Profile from "../components/Profile";
import UserList from "../components/UserList";

type UserSectionProps = {
  type: "profile" | "userList" | "admin";
};

const UserSection: React.FC<UserSectionProps> = ({ type }) => {
  if (type === "profile") return <Profile />;
  if (type === "userList") return <UserList />;
  if (type === "admin") return <AdminPanel />;
  return null;
};

export default UserSection;
