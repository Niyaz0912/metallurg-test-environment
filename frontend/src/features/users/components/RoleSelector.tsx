// frontend/src/features/users/components/RoleSelector.tsx
import React from 'react';

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ 
  currentRole, 
  onRoleChange, 
  disabled = false 
}) => {
  const roles = [
    { value: 'employee', label: 'Сотрудник' },
    { value: 'master', label: 'Мастер' },
    { value: 'director', label: 'Директор' },
    { value: 'admin', label: 'Администратор' }
  ];

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'director': return 'bg-purple-100 text-purple-800';
      case 'master': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="inline-block">
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value)}
        disabled={disabled}
        className={`
          text-sm border border-gray-300 rounded px-2 py-1 
          ${getRoleColor(currentRole)}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
      >
        {roles.map(role => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelector;
