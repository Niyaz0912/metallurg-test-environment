// frontend/src/components/UserSection.tsx

import React from "react";
import Profile from "./Profile";
import UserList from "./UserList";
import AdminPanel from "./AdminPanel";

type UserSectionProps = {
  type: "profile" | "userList" | "admin";
  token: string;
};

const UserSection: React.FC<UserSectionProps> = ({ type, token }) => {
  if (type === "profile") return <Profile token={token} />;
  if (type === "userList") return <UserList token={token} />;
  if (type === "admin") return <AdminPanel token={token} />;
  return null;
};

export default UserSection;
