// frontend/src/features/users/components/TechCardCreateForm.tsx
import React, { useState } from 'react';
import { 
  createTechCard, 
  uploadPdf,
  type CreateTechCardData,
  type TechCardPriority,
  type TechCardStatus
} from '../../../shared/api/techCardsApi';

interface TechCardCreateFormProps {
  onCardCreated: () => void;
}

const TechCardCreateForm: React.FC<TechCardCreateFormProps> = ({ onCardCreated }) => {
  const [formData, setFormData] = useState<CreateTechCardData & { file?: File }>({
    customer: '',
    order: '',
    productName: '',
    partNumber: '',
    quantity: 1,
    description: '',
    priority: 'medium',
    status: 'draft',
    plannedEndDate: '',
    notes: '',
    file: undefined
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer || !formData.order || !formData.productName || !formData.quantity) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      
      // Создаем техкарту
      const newTechCard = await createTechCard({
        customer: formData.customer,
        order: formData.order,
        productName: formData.productName,
        partNumber: formData.partNumber || undefined,
        quantity: Number(formData.quantity),
        description: formData.description || undefined,
        priority: formData.priority,
        status: formData.status,
        plannedEndDate: formData.plannedEndDate || undefined,
        notes: formData.notes || undefined
      });

      // Загружаем PDF файл если выбран
      if (formData.file) {
        try {
          await uploadPdf(newTechCard.id.toString(), formData.file);
        } catch (uploadError) {
          console.error('Ошибка загрузки файла:', uploadError);
          alert('Техкарта создана, но файл не загружен. Вы можете добавить его позже.');
        }
      }

      onCardCreated();
    } catch (error) {
      console.error('Ошибка создания техкарты:', error);
      alert('Ошибка при создании техкарты');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('Файл слишком большой. Максимальный размер: 10MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        alert('Разрешены только PDF файлы');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Создание новой техкарты</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Основная информация */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Основная информация</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заказчик *
            </label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер заказа *
            </label>
            <input
              type="text"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название продукта *
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Артикул
            </label>
            <input
              type="text"
              value={formData.partNumber}
              onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Количество *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Дополнительные параметры */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Дополнительные параметры</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TechCardStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="draft">Черновик</option>
              <option value="active">Активная</option>
              <option value="archived">Архив</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Приоритет
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TechCardPriority })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">🟢 Низкий</option>
              <option value="medium">🟡 Средний</option>
              <option value="high">🟠 Высокий</option>
              <option value="urgent">🔴 Срочный</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Плановая дата завершения
            </label>
            <input
              type="date"
              value={formData.plannedEndDate}
              onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PDF файл техкарты
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {formData.file && (
              <p className="text-sm text-green-600 mt-1">
                Выбран файл: {formData.file.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Описание и заметки */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Краткое описание изделия..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Заметки
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Дополнительные заметки..."
          />
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Создание...' : 'Создать техкарту'}
        </button>
      </div>
    </form>
  );
};

export default TechCardCreateForm;
