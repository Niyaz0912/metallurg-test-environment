// frontend/src/features/techCard/components/SimpleExecutionForm.tsx
import React, { useState } from 'react';
import { 
  addExecution,
  type CreateExecutionData,
  type TechCard 
} from '../../../shared/api/techCardsApi';

interface SimpleExecutionFormProps {
  techCard: TechCard;
  onSuccess: (newExecution: any) => void;
  onCancel: () => void;
}

const SimpleExecutionForm: React.FC<SimpleExecutionFormProps> = ({
  techCard,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    quantityProduced: '',
    setupNumber: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const remainingQuantity = techCard.quantity - techCard.totalProducedQuantity;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.quantityProduced) {
      newErrors.quantityProduced = 'Укажите количество';
    } else {
      const quantity = parseInt(formData.quantityProduced);
      if (quantity < 1) {
        newErrors.quantityProduced = 'Количество должно быть больше 0';
      } else if (quantity > remainingQuantity) {
        newErrors.quantityProduced = `Максимум ${remainingQuantity} шт`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const executionData: CreateExecutionData = {
        quantityProduced: parseInt(formData.quantityProduced),
        setupNumber: formData.setupNumber
      };

      const newExecution = await addExecution(techCard.id.toString(), executionData);
      onSuccess(newExecution);
    } catch (error) {
      console.error('Error adding execution:', error);
      setErrors({ submit: 'Ошибка при сохранении' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
      <h3 className="text-lg font-semibold text-green-900 mb-4">
        ⚡ Быстрая фиксация работы
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Количество */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              📊 Количество произведено *
            </label>
            <input
              type="number"
              value={formData.quantityProduced}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, quantityProduced: e.target.value }));
                if (errors.quantityProduced) {
                  setErrors(prev => ({ ...prev, quantityProduced: '' }));
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.quantityProduced ? 'border-red-300' : 'border-green-300'
              }`}
              placeholder="Количество деталей"
              min="1"
              max={remainingQuantity}
              disabled={loading}
            />
            {errors.quantityProduced ? (
              <p className="text-red-600 text-sm mt-1">{errors.quantityProduced}</p>
            ) : (
              <p className="text-green-600 text-sm mt-1">
                Остается произвести: {remainingQuantity.toLocaleString()} шт
              </p>
            )}
          </div>

          {/* Установка */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              🔧 Номер установки
            </label>
            <select
              value={formData.setupNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, setupNumber: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value={1}>Установка 1</option>
              <option value={2}>Установка 2</option>
              <option value={3}>Установка 3</option>
              <option value={4}>Установка 4</option>
            </select>
            <p className="text-green-600 text-sm mt-1">
              Выберите номер технологической установки
            </p>
          </div>
        </div>

        {/* Ошибка отправки */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Информация */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm">
            <strong>ℹ️ Автоматически заполнится:</strong>
            <br />
            • Ваше имя и фамилия
            <br />
            • Текущая дата и время
            <br />
            • Запись в истории доступов
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Сохранение...</span>
              </span>
            ) : (
              '✅ Зафиксировать работу'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleExecutionForm;
