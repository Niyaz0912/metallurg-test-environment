// frontend/src/features/users/components/RoleEditor.tsx
import React from 'react';
import { UserRole } from '../../../shared/types/index.ts';
import { updateUserRole } from '../../../shared/api/users';

interface RoleEditorProps {
  userId: number;
  currentRole: UserRole;
  token: string;
  onUpdate: () => void;
}

const RoleEditor: React.FC<RoleEditorProps> = ({ userId, currentRole, token, onUpdate }) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const handleRoleChange = async (newRole: UserRole) => {
    setIsUpdating(true);
    try {
      await updateUserRole(userId, newRole, token);
      onUpdate();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <select
      value={currentRole}
      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
      disabled={isUpdating}
      className="border rounded p-1"
    >
      <option value="employee">Сотрудник</option>
      <option value="master">Мастер</option>
      <option value="director">Директор</option>
      <option value="admin">Администратор</option>
    </select>
  );
};

export default RoleEditor;