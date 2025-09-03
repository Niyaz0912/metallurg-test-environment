// frontend/src/features/techCard/components/ExecutionTable.tsx
import React, { useState, useMemo } from 'react';

import { 
  type TechCardExecution 
} from '../../../shared/api/techCardsApi';

interface ExecutionTableProps {
  executions: TechCardExecution[];
  showFilters?: boolean;
}

const ExecutionTable: React.FC<ExecutionTableProps> = ({
  executions,
  showFilters = true
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'executor' | 'quantity' | 'setup'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterExecutor, setFilterExecutor] = useState<string>('all');
  const [filterSetup, setFilterSetup] = useState<string>('all');

  // Получение уникальных исполнителей
  const uniqueExecutors = useMemo(() => {
    const executors = executions.map(exec => ({
      id: exec.executor.id,
      name: `${exec.executor.firstName} ${exec.executor.lastName}`
    }));
    
    const unique = executors.filter((executor, index, self) => 
      index === self.findIndex(e => e.id === executor.id)
    );
    
    return unique.sort((a, b) => a.name.localeCompare(b.name));
  }, [executions]);

  // Получение уникальных установок
  const uniqueSetups = useMemo(() => {
    const setups = [...new Set(executions.map(exec => exec.setupNumber || 1))];
    return setups.sort((a, b) => a - b);
  }, [executions]);

  // Фильтрация и сортировка
  const processedExecutions = useMemo(() => {
    let filtered = [...executions];

    // Фильтрация по исполнителю
    if (filterExecutor !== 'all') {
      filtered = filtered.filter(exec => exec.executor.id.toString() === filterExecutor);
    }

    // Фильтрация по установке
    if (filterSetup !== 'all') {
      filtered = filtered.filter(exec => (exec.setupNumber || 1).toString() === filterSetup);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime();
          break;
        case 'executor': {
          const nameA = `${a.executor.firstName} ${a.executor.lastName}`;
          const nameB = `${b.executor.firstName} ${b.executor.lastName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'quantity': {
          comparison = a.quantityProduced - b.quantityProduced;
          break;
        }
        case 'setup':
          comparison = (a.setupNumber || 1) - (b.setupNumber || 1);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [executions, sortBy, sortOrder, filterExecutor, filterSetup]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const totalQuantity = processedExecutions.reduce((sum, exec) => sum + exec.quantityProduced, 0);

  if (executions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <div className="text-4xl text-gray-400 mb-3">📝</div>
        <p className="text-gray-500">Нет записей о выполнении</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Исполнитель:</label>
            <select
              value={filterExecutor}
              onChange={(e) => setFilterExecutor(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Все</option>
              {uniqueExecutors.map(executor => (
                <option key={executor.id} value={executor.id.toString()}>
                  {executor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Установка:</label>
            <select
              value={filterSetup}
              onChange={(e) => setFilterSetup(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Все</option>
              {uniqueSetups.map(setup => (
                <option key={setup} value={setup.toString()}>
                  Установка {setup}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Показано: {processedExecutions.length} из {executions.length} записей
            {totalQuantity > 0 && (
              <span className="ml-4 font-medium">
                Итого: {totalQuantity.toLocaleString()} шт
              </span>
            )}
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                📅 Дата и время{getSortIcon('date')}
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('executor')}
              >
                👤 Исполнитель{getSortIcon('executor')}
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quantity')}
              >
                📊 Количество{getSortIcon('quantity')}
              </th>
              <th 
                className="px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('setup')}
              >
                🔧 Установка{getSortIcon('setup')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedExecutions.map((execution, index) => (
              <tr 
                key={execution.id} 
                className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">
                      {new Date(execution.executedAt).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="text-gray-500">
                      {new Date(execution.executedAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {execution.executor.firstName.charAt(0)}{execution.executor.lastName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {execution.executor.firstName} {execution.executor.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {execution.quantityProduced.toLocaleString()} шт
                  </span>
                </td>
                
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                    #{execution.setupNumber || 1}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Итоги */}
      {processedExecutions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{processedExecutions.length}</p>
              <p className="text-sm text-gray-600">Записей</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{totalQuantity.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Произведено</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{uniqueExecutors.length}</p>
              <p className="text-sm text-gray-600">Операторов</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{uniqueSetups.length}</p>
              <p className="text-sm text-gray-600">Установок</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionTable;
