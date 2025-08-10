// frontend/src/features/techCard/components/TechCardForm.tsx
import React, { useState } from 'react';
import {
  createTechCard,
  updateTechCard,
  uploadPdf,
  type CreateTechCardData,
  type TechCard
} from '../../../shared/api/techCardsApi';

interface TechCardFormProps {
  techCard?: TechCard;
  onSuccess: () => void;
  onCancel: () => void;
}

const TechCardForm: React.FC<TechCardFormProps> = ({ techCard, onSuccess, onCancel }) => {
  const isEditing = !!techCard;

  // Состояние формы с новыми полями
  const [formData, setFormData] = useState<CreateTechCardData>({
    customer: techCard?.customer || '',
    order: techCard?.order || '',
    productName: techCard?.productName || '',
    quantity: techCard?.quantity || 0,
    partNumber: techCard?.partNumber || '',
    description: techCard?.description || '',
    status: techCard?.status || 'draft',
    // 🆕 Новые поля
    priority: techCard?.priority || 'medium',
    plannedEndDate: techCard?.plannedEndDate ? techCard.plannedEndDate.split('T')[0] : '',
    notes: techCard?.notes || ''
  });

  // Состояние загрузки файла
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer.trim()) {
      newErrors.customer = 'Заказчик обязателен';
    }

    if (!formData.order.trim()) {
      newErrors.order = 'Номер заказа обязателен';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'Название продукта обязательно';
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Количество должно быть больше 0';
    }

    // Проверка PDF файла только при создании новой техкарты    
    if (!pdfFile) {
      if (!isEditing) {
        newErrors.pdfFile = 'PDF файл с техкартой обязателен';
      } else if (!techCard?.pdfUrl) {
        newErrors.pdfFile = 'PDF файл с техкартой обязателен';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменения полей
  const handleInputChange = (field: keyof CreateTechCardData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Drag & Drop для PDF файла
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

    if (pdfFile) {
      if (pdfFile.size > 10 * 1024 * 1024) { // 10MB
        setErrors(prev => ({ ...prev, pdfFile: 'Размер файла не должен превышать 10MB' }));
        return;
      }
      setPdfFile(pdfFile);
      setErrors(prev => ({ ...prev, pdfFile: '' }));
    } else {
      setErrors(prev => ({ ...prev, pdfFile: 'Пожалуйста, выберите PDF файл' }));
    }
  };

  // Выбор файла через input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setErrors(prev => ({ ...prev, pdfFile: 'Размер файла не должен превышать 10MB' }));
        return;
      }
      setPdfFile(file);
      setErrors(prev => ({ ...prev, pdfFile: '' }));
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
      let savedTechCard: TechCard;

      if (isEditing && techCard) {
        savedTechCard = await updateTechCard(techCard.id.toString(), formData);
      } else {
        savedTechCard = await createTechCard(formData);
      }

      if (pdfFile) {
        await uploadPdf(savedTechCard.id.toString(), pdfFile);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving tech card:', error);
      setErrors({ submit: 'Ошибка при сохранении техкарты' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? '✏️ Редактирование техкарты' : '➕ Новая техкарта'}
          </h2>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={loading}
          >
            Отмена
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              📋 Основная информация
            </h3>
            <p className="text-indigo-700 text-sm">
              Заполните основные данные о техкарте. Поля отмеченные * обязательны.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Заказчик */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏢 Заказчик *
              </label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.customer ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="ПАО Северсталь"
                disabled={loading}
              />
              {errors.customer && (
                <p className="text-red-600 text-sm mt-1">{errors.customer}</p>
              )}
            </div>

            {/* Номер заказа */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📋 Номер заказа *
              </label>
              <input
                type="text"
                value={formData.order}
                onChange={(e) => handleInputChange('order', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.order ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="№12345"
                disabled={loading}
              />
              {errors.order && (
                <p className="text-red-600 text-sm mt-1">{errors.order}</p>
              )}
            </div>

            {/* Название продукта */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔧 Название продукта *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.productName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ролик (после термообработки)"
                disabled={loading}
              />
              {errors.productName && (
                <p className="text-red-600 text-sm mt-1">{errors.productName}</p>
              )}
            </div>

            {/* Количество */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📊 Количество деталей *
              </label>
              <input
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1500"
                min="1"
                disabled={loading}
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Артикул */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Артикул
              </label>
              <input
                type="text"
                value={formData.partNumber || ''}
                onChange={(e) => handleInputChange('partNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="МГ 333015.02.001"
                disabled={loading}
              />
            </div>

            {/* 🆕 Приоритет */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ⚡ Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🟠 Высокий</option>
                <option value="urgent">🔴 Срочный</option>
              </select>
            </div>

            {/* 🆕 Плановая дата завершения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📅 Плановая дата завершения
              </label>
              <input
                type="date"
                value={formData.plannedEndDate || ''}
                onChange={(e) => handleInputChange('plannedEndDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            {/* Статус */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ✅ Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                <option value="draft">📝 Черновик</option>
                <option value="active">✅ Активная</option>
                <option value="archived">📁 Архив</option>
              </select>
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📄 Краткое описание
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Краткое описание детали и особенности производства"
              disabled={loading}
            />
          </div>

          {/* 🆕 Заметки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📝 Дополнительные заметки
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Дополнительные заметки, особенности, комментарии..."
              disabled={loading}
            />
          </div>

          {/* Загрузка PDF файла */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📎 PDF файл с техкартой {!isEditing && '*'}
            </h3>

            {/* Текущий файл (при редактировании) */}
            {techCard?.pdfUrl && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  📄 Текущий файл:
                  <a
                    href={techCard.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline hover:no-underline"
                  >
                    Открыть PDF
                  </a>
                </p>
              </div>
            )}

            {/* Drag & Drop зона */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : errors.pdfFile
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {pdfFile ? (
                <div className="space-y-2">
                  <div className="text-green-600 text-4xl">📄</div>
                  <p className="text-green-700 font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    Удалить файл
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-gray-400 text-5xl">📎</div>
                  <div>
                    <p className="text-gray-600 font-medium">
                      Перетащите PDF файл сюда или нажмите для выбора
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Максимальный размер: 10 МБ. Поддерживается только PDF формат.
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="pdf-upload"
                    disabled={loading}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer transition-colors"
                  >
                    Выбрать PDF файл
                  </label>
                </div>
              )}
            </div>

            {errors.pdfFile && (
              <p className="text-red-600 text-sm mt-2">{errors.pdfFile}</p>
            )}
          </div>

          {/* Ошибки отправки */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Сохранение...</span>
                </span>
              ) : (
                isEditing ? 'Сохранить изменения' : 'Создать техкарту'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechCardForm;
