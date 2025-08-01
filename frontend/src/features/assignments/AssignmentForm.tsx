import React, { useState } from 'react';
import { createAssignment } from '../../shared/api/assignmentsApi';

const AssignmentForm: React.FC = () => {
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [operatorId, setOperatorId] = useState<number | ''>('');
  const [machineNumber, setMachineNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!taskDescription || !operatorId || !machineNumber) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      await createAssignment({ 
        taskDescription,
        operatorId: Number(operatorId),
        machineNumber,
        shiftDate: new Date().toISOString(), // пример: ставим текущую дату
        detailName: '', // можно добавить поля по необходимости
        customerName: '',
        plannedQuantity: 0,
        actualQuantity: 0,
        techCardId: 0,
      });
      setSuccess(true);
      setTaskDescription('');
      setOperatorId('');
      setMachineNumber('');
    } catch (err) {
      setError('Ошибка при создании задания');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать новое задание</h2>

      <div>
        <label>Описание задачи: </label><br />
        <textarea 
          value={taskDescription} 
          onChange={(e) => setTaskDescription(e.target.value)} 
          rows={3} 
          cols={40}
          required
        />
      </div>

      <div>
        <label>Идентификатор оператора: </label><br />
        <input 
          type="number" 
          value={operatorId} 
          onChange={(e) => setOperatorId(e.target.value === '' ? '' : Number(e.target.value))}
          required
        />
      </div>

      <div>
        <label>Номер машины: </label><br />
        <input 
          type="text" 
          value={machineNumber} 
          onChange={(e) => setMachineNumber(e.target.value)} 
          required
        />
      </div>

      <button type="submit">Создать</button>

      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>Задание успешно создано!</p>}
    </form>
  );
};

export default AssignmentForm;
