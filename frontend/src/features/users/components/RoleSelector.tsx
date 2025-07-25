// RoleSelector.tsx
import React from 'react';

type Props = {
  userId: number;
  currentRole: string;
  onUpdate: (newRole: string) => void;
};

export const RoleSelector: React.FC<Props> = ({ userId, currentRole, onUpdate }) => {
  return (
    <select 
      value={currentRole}
      onChange={(e) => onUpdate(e.target.value)}
      className="border p-1 rounded"
    >
      <option value="employee">Сотрудник</option>
      <option value="master">Мастер</option>
      <option value="director">Директор</option>
      <option value="admin">Админ</option>
    </select>
  );
};