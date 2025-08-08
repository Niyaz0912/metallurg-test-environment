// frontend/src/features/techCards/components/ExecutionTable.tsx
import React, { useState, useMemo } from 'react';

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

interface ExecutionTableProps {
  executions: TechCardExecution[];
  showFilters?: boolean;
  compact?: boolean;
}

const ExecutionTable: React.FC<ExecutionTableProps> = ({
  executions,
  showFilters = true,
  compact = false
}) => {
  const [sortField, setSortField] = useState<'executedAt' | 'stageName' | 'quantityProduced'>('executedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStage, setFilterStage] = useState('');
  const [filterQuality, setFilterQuality] = useState('');

  // Получаем уникальные этапы для фильтра
  const uniqueStages = useMemo(() => {
    const stages = Array.from(new Set(executions.map(exec => exec.stageName)));
    return stages.sort();
  }, [executions]);

  // Фильтрация и сортировка
  const filteredAndSortedExecutions = useMemo(() => {
    let filtered = executions;

    // Фильтр по этапу
    if (filterStage) {
      filtered = filtered.filter(exec => exec.stageName === filterStage);
    }

    // Фильтр по качеству
    if (filterQuality) {
      if (filterQuality === 'none') {
        filtered = filtered.filter(exec => !exec.qualityStatus);
      } else {
        filtered = filtered.filter(exec => exec.qualityStatus === filterQuality);
      }
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'executedAt':
          aValue = new Date(a.executedAt).getTime();
          bValue = new Date(b.executedAt).getTime();
          break;
        case 'stageName':
          aValue = a.stageName.toLowerCase();
          bValue = b.stageName.toLowerCase();
          break;
        case 'quantityProduced':
          aValue = a.quantityProduced;
          bValue = b.quantityProduced;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [executions, filterStage, filterQuality, sortField, sortDirection]);

  // Обработчик сортировки
  const handleSort = (field: 'executedAt' | 'stageName' | 'quantityProduced') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Статистика
  const totalQuantity = executions.reduce((sum, exec) => sum + exec.quantityProduced, 0);
  const okCount = executions.filter(exec => exec.qualityStatus === 'OK').length;
  const nokCount = executions.filter(exec => exec.qualityStatus === 'NOK').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (executions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-2">📝</div>
        <p className="text-gray-500">Пока нет записей о выполнении</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Статистика */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-600">Всего записей</p>
            <p className="text-xl font-bold text-blue-900">{executions.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-600">Произведено</p>
            <p className="text-xl font-bold text-green-900">{totalQuantity}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <p className="text-sm text-emerald-600">Качество OK</p>
            <p className="text-xl font-bold text-emerald-900">{okCount}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-sm text-red-600">Дефекты NOK</p>
            <p className="text-xl font-bold text-red-900">{nokCount}</p>
          </div>
        </div>
      )}

      {/* Фильтры */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Этап:</label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Все этапы</option>
              {uniqueStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Качество:</label>
            <select
              value={filterQuality}
              onChange={(e) => setFilterQuality(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Все</option>
              <option value="OK">OK</option>
              <option value="NOK">NOK</option>
              <option value="none">Не указано</option>
            </select>
          </div>

          {(filterStage || filterQuality) && (
            <button
              onClick={() => {
                setFilterStage('');
                setFilterQuality('');
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Сбросить фильтры
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600">
            Показано: {filteredAndSortedExecutions.length} из {executions.length}
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th 
                className="border border-gray-300 px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('executedAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Дата</span>
                  <span className="text-xs">{getSortIcon('executedAt')}</span>
                </div>
              </th>
              <th 
                className="border border-gray-300 px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('stageName')}
              >
                <div className="flex items-center space-x-1">
                  <span>Этап</span>
                  <span className="text-xs">{getSortIcon('stageName')}</span>
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left">Исполнитель</th>
              <th 
                className="border border-gray-300 px-4 py-3 text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quantityProduced')}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Кол-во</span>
                  <span className="text-xs">{getSortIcon('quantityProduced')}</span>
                </div>
              </th>
              <th className="border border-gray-300 px-4 py-3 text-center">Качество</th>
              {!compact && <th className="border border-gray-300 px-4 py-3 text-left">Комментарий</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedExecutions.map((execution) => (
              <tr key={execution.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-3 text-sm">
                  {formatDate(execution.executedAt)}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <span className="font-medium text-gray-900">{execution.stageName}</span>
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  <span className="text-gray-700">
                    {execution.executor.firstName} {execution.executor.lastName}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <span className="font-semibold text-gray-900">
                    {execution.quantityProduced}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {execution.qualityStatus ? (
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      execution.qualityStatus === 'OK' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {execution.qualityStatus === 'OK' ? '✅ OK' : '❌ NOK'}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                {!compact && (
                  <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                    {execution.qualityComment ? (
                      <span title={execution.qualityComment}>
                        {execution.qualityComment.length > 50 
                          ? `${execution.qualityComment.substring(0, 50)}...`
                          : execution.qualityComment
                        }
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExecutionTable;
