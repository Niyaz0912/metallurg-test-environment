import React, { useState } from 'react';

import { createTask } from '../../../shared/api/tasksApi';

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedDepartmentId, setAssignedDepartmentId] = useState<number | ''>('');
  const [createdById, setCreatedById] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title || assignedDepartmentId === '' || createdById === '') {
      setError('Пожалуйста, заполните обязательные поля: заголовок, отдел назначения, создатель');
      return;
    }

    try {
      await createTask({
        title,
        description,
        assignedDepartmentId: Number(assignedDepartmentId),
        createdById: Number(createdById),
        // остальные поля можно добавить при необходимости
      });
      setSuccess(true);
      setTitle('');
      setDescription('');
      setAssignedDepartmentId('');
      setCreatedById('');
    } catch {
      setError('Ошибка при создании задачи');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать задачу</h2>

      <div>
        <label>Заголовок задачи: </label><br />
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
          maxLength={255}
        />
      </div>

      <div>
        <label>Описание: </label><br />
        <textarea 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={4} 
        />
      </div>

      <div>
        <label>Отдел назначения (ID): </label><br />
        <input 
          type="number" 
          value={assignedDepartmentId} 
          onChange={e => setAssignedDepartmentId(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
        />
      </div>

      <div>
        <label>ID создателя: </label><br />
        <input 
          type="number" 
          value={createdById} 
          onChange={e => setCreatedById(e.target.value === '' ? '' : Number(e.target.value))} 
          required 
        />
      </div>

      <button type="submit">Создать</button>

      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>Задача успешно создана!</p>}
    </form>
  );
};

export default TaskForm;
