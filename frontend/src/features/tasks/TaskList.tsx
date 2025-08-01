import React, { useEffect, useState } from 'react';
import { fetchTasks } from '../../shared/api/tasksApi';

interface Task {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedDepartmentId: number;
  assignedUserId?: number;
  dueDate?: string;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError('Ошибка при загрузке задач');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  if (loading) return <div>Загрузка задач...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Список задач</h2>
      {tasks.length === 0 ? (
        <p>Задачи не найдены.</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>
              <b>{task.title}</b> — {task.description?.substring(0, 50)}{task.description && task.description.length > 50 ? '...' : ''}
              <br />
              Статус: {task.status}, Приоритет: {task.priority}
              <br />
              Дата выполнения: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Не назначена'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
