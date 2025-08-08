// frontend/src/features/techCards/components/ExecutionForm.tsx
import React, { useState } from 'react';
import { addExecution } from '../../../shared/api/techCardsApi';

interface ExecutionFormProps {
  techCardId: string;
  productionStages?: ProductionStage[];
  onSuccess: (execution: TechCardExecution) => void;
  onCancel: () => void;
}

interface ProductionStage {
  name: string;
  description: string;
  tools: string[];
  duration?: number;
  qualityCheckpoints?: string[];
}

interface TechCardExecution {
  id: number;
  stageName: string;
  quantityProduced: number;
  executedAt: string;
  qualityStatus?: 'OK' | 'NOK';
  qualityComment?: string;
  executor: {
    id: number;
    firstName: string;
    lastName: string;
  };
  qualityInspector?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

const ExecutionForm: React.FC<ExecutionFormProps> = ({
  techCardId,
  productionStages = [],
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    stageName: '',
    quantityProduced: '',
    qualityStatus: '' as 'OK' | 'NOK' | '',
    qualityComment: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.stageName.trim()) {
      newErrors.stageName = 'Название этапа обязательно';
    }

    if (!formData.quantityProduced || parseInt(formData.quantityProduced) < 1) {
      newErrors.quantityProduced = 'Количество должно быть больше 0';
    }

    if (formData.qualityStatus === 'NOK' && !formData.qualityComment.trim()) {
      newErrors.qualityComment = 'При статусе NOK комментарий обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменения полей
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const execution = await addExecution(techCardId, {
        stageName: formData.stageName,
        quantityProduced: parseInt(formData.quantityProduced),
        qualityStatus: formData.qualityStatus || undefined,
        qualityComment: formData.qualityComment || undefined
      });

      onSuccess(execution);
    } catch (error) {
      console.error('Error adding execution:', error);
      alert('Ошибка при добавлении выполнения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          ➕ Добавить выполнение этапа
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Название этапа */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Этап производства *
            </label>
            {productionStages.length > 0 ? (
              <select
                value={formData.stageName}
                onChange={(e) => handleInputChange('stageName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.stageName ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">Выберите этап</option>
                {productionStages.map((stage, index) => (
                  <option key={index} value={stage.name}>
                    {stage.name}
                  </option>
                ))}
                <option value="custom">Другой этап</option>
              </select>
            ) : (
              <input
                type="text"
                value={formData.stageName}
                onChange={(e) => handleInputChange('stageName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.stageName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Название этапа"
                disabled={loading}
              />
            )}
            {errors.stageName && (
              <p className="text-red-600 text-sm mt-1">{errors.stageName}</p>
            )}
          </div>

          {/* Количество */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Количество произведено *
            </label>
            <input
              type="number"
              value={formData.quantityProduced}
              onChange={(e) => handleInputChange('quantityProduced', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.quantityProduced ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Количество штук"
              min="1"
              disabled={loading}
            />
            {errors.quantityProduced && (
              <p className="text-red-600 text-sm mt-1">{errors.quantityProduced}</p>
            )}
          </div>

          {/* Статус качества */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Контроль качества
            </label>
            <select
              value={formData.qualityStatus}
              onChange={(e) => handleInputChange('qualityStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              disabled={loading}
            >
              <option value="">Не указан</option>
              <option value="OK">✅ OK - Качество соответствует</option>
              <option value="NOK">❌ NOK - Обнаружены дефекты</option>
            </select>
          </div>

          {/* Комментарий */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Комментарий {formData.qualityStatus === 'NOK' && '*'}
            </label>
            <input
              type="text"
              value={formData.qualityComment}
              onChange={(e) => handleInputChange('qualityComment', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                errors.qualityComment ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={
                formData.qualityStatus === 'NOK' 
                  ? 'Опишите обнаруженные дефекты' 
                  : 'Дополнительные заметки'
              }
              disabled={loading}
            />
            {errors.qualityComment && (
              <p className="text-red-600 text-sm mt-1">{errors.qualityComment}</p>
            )}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Добавление...</span>
              </span>
            ) : (
              'Добавить выполнение'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExecutionForm;
