// src/features/departments/sections/Production/ProductionTasks.tsx
import React from 'react';

interface Task {
  id: number;
  title: string;
  status: string;
}

export const ProductionTasks = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div>
      <h2>Производственные задачи</h2>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};