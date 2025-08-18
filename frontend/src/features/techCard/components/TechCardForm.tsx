// frontend/src/features/techCard/components/TechCardForm.tsx
import React, { useState } from 'react';
import { 
  createTechCard, 
  updateTechCard,
  uploadPdf,
  type TechCard,
  type CreateTechCardData,
  type UpdateTechCardData,
  type TechCardPriority,
  type TechCardStatus
} from '../../../shared/api/techCardsApi';

// ✅ ИСПРАВЛЕНО: Добавлен onClose и onSuccess в интерфейс
interface TechCardFormProps {
  techCard?: TechCard;
  isEdit?: boolean;
  onClose: () => void; // ← Обязательный пропс
  onSuccess?: () => void; // ← Новый необязательный пропс
}

const TechCardForm: React.FC<TechCardFormProps> = ({ 
  techCard, 
  isEdit = false, 
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<CreateTechCardData & { file?: File }>({
    customer: techCard?.customer || '',
    order: techCard?.order || '',
    productName: techCard?.productName || '',
    partNumber: techCard?.partNumber || '',
    quantity: techCard?.quantity || 1,
    description: techCard?.description || '',
    priority: techCard?.priority || 'medium',
    status: techCard?.status || 'draft',
    plannedEndDate: techCard?.plannedEndDate ? techCard.plannedEndDate.split('T')[0] : '',
    notes: techCard?.notes || '',
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
      
      let savedCard: TechCard;
      if (isEdit && techCard) {
        // Обновляем существующую техкарту
        savedCard = await updateTechCard(techCard.id.toString(), {
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
      } else {
        // Создаем новую техкарту
        savedCard = await createTechCard({
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
      }

      // Загружаем PDF файл если выбран
      if (formData.file) {
        try {
          await uploadPdf(savedCard.id.toString(), formData.file);
        } catch (uploadError) {
          console.error('Ошибка загрузки файла:', uploadError);
          alert('Техкарта сохранена, но файл не загружен. Попробуйте позже.');
        }
      }

      // ✅ Используем onClose для закрытия формы
      onClose();
      
      // ✅ Вызываем onSuccess если передан
      onSuccess && onSuccess();
      
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Ошибка при сохранении техкарты');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? '✏️ Редактирование техкарты' : '✨ Создание техкарты'}
          </h3>
          {/* ✅ ИСПОЛЬЗУЕМ onClose для кнопки закрытия */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Основная информация */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 border-b pb-2">📝 Основная информация</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заказчик *
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Введите название заказчика"
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
                  placeholder="Введите номер заказа"
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
                  placeholder="Введите название изделия"
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
                  placeholder="Введите артикул (опционально)"
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
              <h4 className="font-medium text-gray-900 border-b pb-2">⚙️ Параметры</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TechCardStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="draft">📝 Черновик</option>
                  <option value="active">✅ Активная</option>
                  <option value="archived">📁 Архив</option>
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
                {isEdit && techCard?.pdfUrl && (
                  <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    📄 Текущий PDF файл загружен
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formData.file && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Выбран файл: {formData.file.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Максимальный размер: 10MB. Только PDF файлы.
                </p>
              </div>
            </div>
          </div>

          {/* Описание и заметки */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b pb-2">📄 Дополнительная информация</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Краткое описание изделия и технологических особенностей..."
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
                placeholder="Дополнительные заметки, требования, особенности производства..."
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {/* ✅ ИСПОЛЬЗУЕМ onClose для кнопки отмены */}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Отменить
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isEdit ? '⏳ Сохранение...' : '⏳ Создание...') : (isEdit ? '💾 Сохранить' : '✨ Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechCardForm;
