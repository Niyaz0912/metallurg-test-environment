// frontend/src/features/techCards/components/ProductionStages.tsx
import React, { useState } from 'react';

interface ProductionStage {
  name: string;
  description: string;
  tools: string[];
  duration?: number;
  qualityCheckpoints?: string[];
}

interface ProductionStagesProps {
  stages: ProductionStage[];
  compact?: boolean;
  showProgress?: boolean;
  completedStages?: string[];
}

const ProductionStages: React.FC<ProductionStagesProps> = ({
  stages,
  compact = false,
  showProgress = false,
  completedStages = []
}) => {
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedStages(newExpanded);
  };

  const isStageCompleted = (stageName: string) => {
    return completedStages.includes(stageName);
  };

  const getStageStatus = (stageName: string, index: number) => {
    if (!showProgress) return 'default';
    
    if (isStageCompleted(stageName)) return 'completed';
    
    // Проверяем, выполнены ли все предыдущие этапы
    const previousStagesCompleted = stages
      .slice(0, index)
      .every(stage => isStageCompleted(stage.name));
    
    if (previousStagesCompleted) return 'current';
    
    return 'pending';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🔄';
      case 'pending': return '⏳';
      default: return '📋';
    }
  };

  const getStageColors = (status: string) => {
    switch (status) {
      case 'completed': 
        return 'bg-green-100 border-green-200 text-green-800';
      case 'current': 
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'pending': 
        return 'bg-gray-100 border-gray-200 text-gray-600';
      default: 
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  const getNumberColors = (status: string) => {
    switch (status) {
      case 'completed': 
        return 'bg-green-500 text-white';
      case 'current': 
        return 'bg-blue-500 text-white';
      case 'pending': 
        return 'bg-gray-300 text-gray-600';
      default: 
        return 'bg-indigo-500 text-white';
    }
  };

  if (!stages || stages.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">⚙️</div>
        <p className="text-gray-500">Этапы производства не определены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Прогресс-бар */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Прогресс выполнения</span>
            <span className="text-sm font-bold text-gray-900">
              {completedStages.length} из {stages.length} этапов
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedStages.length / stages.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Timeline этапов */}
      <div className={compact ? 'space-y-2' : 'space-y-4'}>
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.name, index);
          const isExpanded = expandedStages.has(index);
          const isLast = index === stages.length - 1;

          return (
            <div key={index} className="relative">
              {/* Линия соединения */}
              {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-300 z-0"></div>
              )}

              {/* Карточка этапа */}
              <div className={`relative z-10 border rounded-lg ${getStageColors(status)} ${
                compact ? 'p-3' : 'p-4'
              }`}>
                <div className="flex items-start space-x-4">
                  {/* Номер этапа */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getNumberColors(status)}`}>
                    {showProgress ? getStageIcon(status) : index + 1}
                  </div>

                  {/* Содержимое этапа */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
                          {stage.name}
                        </h4>
                        
                        {stage.duration && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mt-1">
                            ⏱️ {stage.duration} мин
                          </span>
                        )}
                        
                        {!compact && (
                          <p className="text-gray-600 mt-2">{stage.description}</p>
                        )}
                      </div>

                      {/* Кнопка развернуть/свернуть */}
                      {(stage.tools.length > 0 || (stage.qualityCheckpoints && stage.qualityCheckpoints.length > 0)) && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isExpanded ? '▼' : '▶️'}
                        </button>
                      )}
                    </div>

                    {/* Компактное описание */}
                    {compact && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{stage.description}</p>
                    )}

                    {/* Развернутая информация */}
                    {isExpanded && (
                      <div className="mt-4 space-y-3">
                        {/* Инструменты */}
                        {stage.tools.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">🔧 Инструменты:</p>
                            <div className="flex flex-wrap gap-2">
                              {stage.tools.map((tool, toolIndex) => (
                                <span 
                                  key={toolIndex}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded border border-blue-200"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Контрольные точки */}
                        {stage.qualityCheckpoints && stage.qualityCheckpoints.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">✅ Контроль качества:</p>
                            <div className="space-y-1">
                              {stage.qualityCheckpoints.map((checkpoint, cpIndex) => (
                                <div 
                                  key={cpIndex}
                                  className="flex items-center space-x-2 text-sm text-gray-600"
                                >
                                  <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                  <span>{checkpoint}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Статус выполнения */}
                    {showProgress && status !== 'default' && (
                      <div className="mt-3 text-sm">
                        {status === 'completed' && (
                          <span className="text-green-600 font-medium">✅ Этап завершен</span>
                        )}
                        {status === 'current' && (
                          <span className="text-blue-600 font-medium">🔄 Текущий этап</span>
                        )}
                        {status === 'pending' && (
                          <span className="text-gray-500">⏳ Ожидает выполнения</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Итоговая статистика */}
      {!compact && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">📊 Сводка по этапам</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Всего этапов</p>
              <p className="text-xl font-bold text-gray-900">{stages.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">С инструментами</p>
              <p className="text-xl font-bold text-blue-600">
                {stages.filter(s => s.tools.length > 0).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">С контролем</p>
              <p className="text-xl font-bold text-purple-600">
                {stages.filter(s => s.qualityCheckpoints && s.qualityCheckpoints.length > 0).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Общее время</p>
              <p className="text-xl font-bold text-gray-900">
                {stages.reduce((total, stage) => total + (stage.duration || 0), 0)} мин
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionStages;
