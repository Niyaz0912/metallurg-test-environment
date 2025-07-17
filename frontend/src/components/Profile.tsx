import React from "react";

type ProfileProps = {
  token: string;
};

export default function Profile({ token }: ProfileProps) {
  // Здесь можешь использовать token для запросов
  return <div>Профиль. Ваш токен: {token}</div>;
}

