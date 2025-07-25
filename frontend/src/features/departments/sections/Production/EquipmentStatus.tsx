// src/features/departments/sections/Production/EquipmentStatus.tsx
import React from 'react';

interface Equipment {
  id: number;
  name: string;
  status: string;
}

export const EquipmentStatus = ({ equipment }: { equipment: Equipment[] }) => {
  return (
    <div>
      <h2>Состояние оборудования</h2>
      {equipment.map(item => (
        <div key={item.id}>
          {item.name} - {item.status}
        </div>
      ))}
    </div>
  );
};