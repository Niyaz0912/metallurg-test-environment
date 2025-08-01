import React, { useEffect, useState } from 'react';
import { fetchAssignments } from '../../shared/api/assignmentsApi'

interface Assignment {
  id: number;
  operatorId: number;
  shiftDate: string;
  taskDescription: string;
  machineNumber: string;
  detailName: string;
  customerName: string;
  plannedQuantity: number;
  actualQuantity: number;
  techCardId: number;
}

const AssignmentList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const response = await fetchAssignments();
        setAssignments(response.data);
      } catch (err) {
        setError('Ошибка при загрузке заданий');
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, []);

  if (loading) return <div>Загрузка заданий...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Список заданий</h2>
      {assignments.length === 0 ? (
        <p>Задания не найдены.</p>
      ) : (
        <ul>
          {assignments.map((a) => (
            <li key={a.id}>
              <b>Задача:</b> {a.taskDescription} (Оператор: {a.operatorId}, Машина: {a.machineNumber})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssignmentList;
