// frontend/src/features/techCards/components/TechCardForm.tsx
import React, { useState, useEffect } from 'react';
import { createTechCard, updateTechCard } from '../../../shared/api/techCardsApi';

interface TechCard {
  id: number;
  productName: string;
  partNumber?: string;
  description?: string;
  drawingUrl?: string;
  specifications?: any;
  productionStages?: ProductionStage[];
  estimatedTimePerUnit?: number;
  notes?: string;
  status: 'draft' | 'active' | 'archived';
  version: string;
}

interface ProductionStage {
  name: string;
  description: string;
  tools: string[];
  duration?: number;
  qualityCheckpoints?: string[];
}

interface TechCardFormProps {
  techCard?: TechCard;
  onSuccess: () => void;
  onCancel: () => void;
}

const TechCardForm: React.FC<TechCardFormProps> = ({ techCard, onSuccess, onCancel }) => {
  const isEditing = !!techCard;

  // Основные поля формы
  const [formData, setFormData] = useState({
    productName: '',
    partNumber: '',
    description: '',
    drawingUrl: '',
    estimatedTimePerUnit: '',
    notes: '',
    status: 'draft' as 'draft' | 'active' | 'archived'
  });

  // Этапы производства
  const [productionStages, setProductionStages] = useState<ProductionStage[]>([]);
  const [showStageForm, setShowStageForm] = useState(false);
  const [currentStage, setCurrentStage] = useState<ProductionStage>({
    name: '',
    description: '',
    tools: [],
    duration: undefined,
    qualityCheckpoints: []
  });
  const [toolInput, setToolInput] = useState('');
  const [checkpointInput, setCheckpointInput] = useState('');

  // Состояния
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Заполнение формы при редактировании
  useEffect(() => {
    if (techCard) {
      setFormData({
        productName: techCard.productName || '',
        partNumber: techCard.partNumber || '',
        description: techCard.description || '',
        drawingUrl: techCard.drawingUrl || '',
        estimatedTimePerUnit: techCard.estimatedTimePerUnit?.toString() || '',
        notes: techCard.notes || '',
        status: techCard.status || 'draft'
      });

      if (techCard.productionStages) {
        setProductionStages(techCard.productionStages);
      }
    }
  }, [techCard]);

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Название продукта обязательно';
    }

    if (formData.estimatedTimePerUnit && isNaN(Number(formData.estimatedTimePerUnit))) {
      newErrors.estimatedTimePerUnit = 'Время должно быть числом';
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

  // Добавление инструмента к этапу
  const addTool = () => {
    if (toolInput.trim() && !currentStage.tools.includes(toolInput.trim())) {
      setCurrentStage(prev => ({
        ...prev,
        tools: [...prev.tools, toolInput.trim()]
      }));
      setToolInput('');
    }
  };

  // Удаление инструмента
  const removeTool = (toolToRemove: string) => {
    setCurrentStage(prev => ({
      ...prev,
      tools: prev.tools.filter(tool => tool !== toolToRemove)
    }));
  };

  // Добавление контрольной точки
  const addCheckpoint = () => {
    if (checkpointInput.trim() && !currentStage.qualityCheckpoints?.includes(checkpointInput.trim())) {
      setCurrentStage(prev => ({
        ...prev,
        qualityCheckpoints: [...(prev.qualityCheckpoints || []), checkpointInput.trim()]
      }));
      setCheckpointInput('');
    }
  };

  // Удаление контрольной точки
  const removeCheckpoint = (checkpointToRemove: string) => {
    setCurrentStage(prev => ({
      ...prev,
      qualityCheckpoints: prev.qualityCheckpoints?.filter(cp => cp !== checkpointToRemove) || []
    }));
  };

  // Сохранение этапа
  const saveStage = () => {
    if (!currentStage.name.trim() || !currentStage.description.trim()) {
      alert('Заполните название и описание этапа');
      return;
    }

    setProductionStages(prev => [...prev, { ...currentStage }]);
    setCurrentStage({
      name: '',
      description: '',
      tools: [],
      duration: undefined,
      qualityCheckpoints: []
    });
    setShowStageForm(false);
  };

  // Удаление этапа
  const removeStage = (index: number) => {
    setProductionStages(prev => prev.filter((_, i) => i !== index));
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        productName: formData.productName,
        partNumber: formData.partNumber || undefined,
        description: formData.description || undefined,
        drawingUrl: formData.drawingUrl || undefined,
        productionStages: productionStages.length > 0 ? productionStages : undefined,
        estimatedTimePerUnit: formData.estimatedTimePerUnit ? parseInt(formData.estimatedTimePerUnit) : undefined,
        notes: formData.notes || undefined,
        status: formData.status
      };

      if (isEditing && techCard) {
        await updateTechCard(techCard.id.toString(), submitData);
      } else {
        await createTechCard(submitData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving tech card:', error);
      alert('Ошибка при сохранении техкарты');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">📋 Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название продукта *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.productName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Например: Секция цепи конвейера"
                  disabled={loading}
                />
                {errors.productName && (
                  <p className="text-red-600 text-sm mt-1">{errors.productName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Артикул
                </label>
                <input
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => handleInputChange('partNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Например: SC-001"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Краткое описание детали и её назначения"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ссылка на чертеж
                </label>
                <input
                  type="url"
                  value={formData.drawingUrl}
                  onChange={(e) => handleInputChange('drawingUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com/drawing.pdf"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Время на деталь (мин)
                </label>
                <input
                  type="number"
                  value={formData.estimatedTimePerUnit}
                  onChange={(e) => handleInputChange('estimatedTimePerUnit', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                    errors.estimatedTimePerUnit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="60"
                  min="1"
                  disabled={loading}
                />
                {errors.estimatedTimePerUnit && (
                  <p className="text-red-600 text-sm mt-1">{errors.estimatedTimePerUnit}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  <option value="draft">Черновик</option>
                  <option value="active">Активная</option>
                  <option value="archived">Архив</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заметки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Дополнительные заметки и комментарии"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Этапы производства */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">⚙️ Этапы производства</h3>
              <button
                type="button"
                onClick={() => setShowStageForm(!showStageForm)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={loading}
              >
                + Добавить этап
              </button>
            </div>

            {/* Форма добавления этапа */}
            {showStageForm && (
              <div className="bg-white rounded-lg p-4 mb-4 border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название этапа *
                    </label>
                    <input
                      type="text"
                      value={currentStage.name}
                      onChange={(e) => setCurrentStage(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      placeholder="Например: Токарная обработка"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Длительность (мин)
                    </label>
                    <input
                      type="number"
                      value={currentStage.duration || ''}
                      onChange={(e) => setCurrentStage(prev => ({ ...prev, duration: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      min="1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание этапа *
                    </label>
                    <textarea
                      value={currentStage.description}
                      onChange={(e) => setCurrentStage(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="Подробное описание операций этапа"
                    />
                  </div>

                  {/* Инструменты */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Инструменты
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        placeholder="Название инструмента"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                      />
                      <button
                        type="button"
                        onClick={addTool}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        +
                      </button>
                    </div>
                    {currentStage.tools.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentStage.tools.map((tool, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center space-x-1"
                          >
                            <span>{tool}</span>
                            <button
                              type="button"
                              onClick={() => removeTool(tool)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Контрольные точки */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Контрольные точки
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={checkpointInput}
                        onChange={(e) => setCheckpointInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        placeholder="Что проверять"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCheckpoint())}
                      />
                      <button
                        type="button"
                        onClick={addCheckpoint}
                        className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        +
                      </button>
                    </div>
                    {currentStage.qualityCheckpoints && currentStage.qualityCheckpoints.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentStage.qualityCheckpoints.map((checkpoint, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm flex items-center space-x-1"
                          >
                            <span>{checkpoint}</span>
                            <button
                              type="button"
                              onClick={() => removeCheckpoint(checkpoint)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowStageForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={saveStage}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Сохранить этап
                  </button>
                </div>
              </div>
            )}

            {/* Список этапов */}
            {productionStages.length > 0 ? (
              <div className="space-y-3">
                {productionStages.map((stage, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <h4 className="font-medium text-gray-900">{stage.name}</h4>
                          {stage.duration && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {stage.duration} мин
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{stage.description}</p>
                        
                        {stage.tools.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Инструменты:</p>
                            <div className="flex flex-wrap gap-1">
                              {stage.tools.map((tool, toolIndex) => (
                                <span key={toolIndex} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {stage.qualityCheckpoints && stage.qualityCheckpoints.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Контроль качества:</p>
                            <div className="flex flex-wrap gap-1">
                              {stage.qualityCheckpoints.map((checkpoint, cpIndex) => (
                                <span key={cpIndex} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                  {checkpoint}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeStage(index)}
                        className="ml-4 text-red-600 hover:text-red-800"
                        title="Удалить этап"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Этапы производства не добавлены
              </p>
            )}
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
