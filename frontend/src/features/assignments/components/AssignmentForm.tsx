// frontend/src/features/assignments/components/AssignmentForm.tsx
import React, { useState, useEffect } from 'react';
import { createAssignment } from '../../../shared/api/assignmentsApi';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

interface TechCard {
  id: number;
  title: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  productName: string;
}

interface AssignmentFormProps {
  onAssignmentCreated?: () => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onAssignmentCreated }) => {
  const [formData, setFormData] = useState({
    taskDescription: '',
    operatorId: '',
    machineNumber: '',
    shiftDate: new Date().toISOString().split('T')[0], // Сегодняшняя дата
    shiftType: 'day' as 'day' | 'night',
    detailName: '',
    customerName: '',
    plannedQuantity: '',
    techCardId: ''
  });
  
  const [operators, setOperators] = useState<User[]>([]);
  const [techCards, setTechCards] = useState<TechCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Загрузка списка операторов и техкарт
  useEffect(() => {
    fetchOperators();
    fetchTechCards();
  }, []);

  const fetchOperators = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const users = await response.json();
        // Фильтруем только операторов и сотрудников
        const operatorUsers = users.filter((user: User) => 
          user.role === 'employee' || user.role === 'operator'
        );
        setOperators(operatorUsers);
      }
    } catch (error) {
      console.error('Ошибка загрузки операторов:', error);
    }
  };

  const fetchTechCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/techcards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const cards = await response.json();
        // Показываем только активные техкарты
        const activeCards = cards.filter((card: TechCard) => card.status === 'active');
        setTechCards(activeCards);
      }
    } catch (error) {
      console.error('Ошибка загрузки технологических карт:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (!formData.taskDescription || !formData.operatorId || !formData.machineNumber) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      await createAssignment({
        taskDescription: formData.taskDescription,
        operatorId: Number(formData.operatorId),
        machineNumber: formData.machineNumber,
        shiftDate: formData.shiftDate,
        shiftType: formData.shiftType,
        detailName: formData.detailName,
        customerName: formData.customerName,
        plannedQuantity: Number(formData.plannedQuantity) || 0,
        ...(formData.techCardId && { techCardId: Number(formData.techCardId) }),

      });

      // Сброс формы
      setFormData({
        taskDescription: '',
        operatorId: '',
        machineNumber: '',
        shiftDate: new Date().toISOString().split('T')[0],
        shiftType: 'day',
        detailName: '',
        customerName: '',
        plannedQuantity: '',
        techCardId: ''
      });

      onAssignmentCreated?.();
      
    } catch (err) {
      setError('Ошибка при создании задания');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Создать новое задание</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Оператор <span className="text-red-500">*</span>
            </label>
            <select
              name="operatorId"
              value={formData.operatorId}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Выберите оператора</option>
              {operators.map(operator => (
                <option key={operator.id} value={operator.id}>
                  {operator.firstName} {operator.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Номер машины <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="machineNumber"
              value={formData.machineNumber}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: СТ-001"
            />
          </div>
        </div>

        {/* ✅ НОВОЕ ПОЛЕ: Выбор технологической карты */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Технологическая карта
          </label>
          <select
            name="techCardId"
            value={formData.techCardId}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Выберите технологическую карту (опционально)</option>
            {techCards.map(card => (
              <option key={card.id} value={card.id}>
                {card.title} v{card.version} - {card.productName}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Привязка техкарты поможет оператору следовать технологическому процессу
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Дата смены <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="shiftDate"
              value={formData.shiftDate}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Тип смены
            </label>
            <select
              name="shiftType"
              value={formData.shiftType}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="day">Дневная</option>
              <option value="night">Ночная</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Плановое количество
            </label>
            <input
              type="number"
              name="plannedQuantity"
              value={formData.plannedQuantity}
              onChange={handleInputChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Название детали
            </label>
            <input
              type="text"
              name="detailName"
              value={formData.detailName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: Втулка стальная"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Заказчик
            </label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Например: ООО МеталлСтрой"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Описание задачи <span className="text-red-500">*</span>
          </label>
          <textarea
            name="taskDescription"
            value={formData.taskDescription}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Подробное описание задачи для оператора..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Создание...' : 'Создать задание'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;
