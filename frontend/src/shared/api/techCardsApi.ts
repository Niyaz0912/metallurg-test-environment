const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ========== ОБНОВЛЕННЫЕ УПРОЩЕННЫЕ ТИПЫ ДАННЫХ ==========

interface TechCard {
  id: number;
  // ✅ ОСНОВНЫЕ ПОЛЯ
  customer: string;                    // Заказчик
  order: string;                       // Номер заказа  
  productName: string;                 // Название детали
  partNumber?: string;                 // Артикул
  quantity: number;                    // Общее количество
  
  // ✅ PDF ФАЙЛ (вместо сложных данных)
  pdfUrl?: string;                     // Ссылка на PDF файл
  pdfFileSize?: number;                // 🆕 Размер PDF файла в байтах
  
  // ✅ УПРОЩЕННЫЕ ПОЛЯ
  description?: string;                // Краткое описание (опционально)
  status: 'draft' | 'active' | 'archived';
  totalProducedQuantity: number;       // Произведено деталей
  
  // 🆕 НОВЫЕ ПОЛЯ ПЛАНИРОВАНИЯ
  priority: 'low' | 'medium' | 'high' | 'urgent';  // Приоритет техкарты
  plannedEndDate?: string;             // Плановая дата завершения
  actualEndDate?: string;              // Фактическая дата завершения
  notes?: string;                      // Дополнительные заметки
  
  // ✅ МЕТАДАННЫЕ
  createdAt: string;
  updatedAt: string;
  createdById?: number;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  
  // ✅ СВЯЗАННЫЕ ДАННЫЕ
  executions?: TechCardExecution[];
  accesses?: TechCardAccess[];         // История доступов
}

interface TechCardExecution {
  id: number;
  techCardId: number;
  executedById: number;
  // ✅ УПРОЩЕННЫЕ ПОЛЯ ВЫПОЛНЕНИЯ
  quantityProduced: number;            // Количество деталей
  setupNumber?: number;                // Номер установки (1, 2, 3)
  executedAt: string;                  // Время выполнения
  
  // ✅ ИСПОЛНИТЕЛЬ
  executor: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// ✅ ИСТОРИЯ ДОСТУПОВ К ТЕХКАРТЕ
interface TechCardAccess {
  id: number;
  techCardId: number;
  userId: number;
  accessedAt: string;                  // Время доступа
  action: 'view' | 'work';            // Тип действия
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// 🆕 ТИПЫ ДЛЯ НОВЫХ ПОЛЕЙ
export type TechCardPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TechCardStatus = 'draft' | 'active' | 'archived';

// ✅ ОБНОВЛЕННЫЙ ИНТЕРФЕЙС СОЗДАНИЯ
interface CreateTechCardData {
  customer: string;                    // Обязательно
  order: string;                       // Обязательно
  productName: string;                 // Обязательно
  quantity: number;                    // Обязательно
  partNumber?: string;                 // Опционально
  description?: string;                // Опционально
  pdfUrl?: string;                     // Опционально (загружается отдельно)
  status?: TechCardStatus;
  
  // 🆕 НОВЫЕ ПОЛЯ
  priority?: TechCardPriority;         // Приоритет (по умолчанию 'medium')
  plannedEndDate?: string;             // Плановая дата завершения
  notes?: string;                      // Дополнительные заметки
}

// 🆕 ИНТЕРФЕЙС ОБНОВЛЕНИЯ ТЕХКАРТЫ
interface UpdateTechCardData extends Partial<CreateTechCardData> {
  actualEndDate?: string;              // Фактическая дата завершения
  totalProducedQuantity?: number;      // Произведено деталей
}

// ✅ УПРОЩЕННЫЙ ИНТЕРФЕЙС ВЫПОЛНЕНИЯ
interface CreateExecutionData {
  quantityProduced: number;            // Обязательно
  setupNumber?: number;                // Опционально (по умолчанию 1)
}

// 🆕 ИНТЕРФЕЙС ФИЛЬТРАЦИИ
interface TechCardFilters {
  customer?: string;
  status?: TechCardStatus;
  priority?: TechCardPriority;
  dateFrom?: string;
  dateTo?: string;
}

// 🆕 ЦЕНТРАЛИЗОВАННАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ URL ФАЙЛОВ
export const getFileUrl = (relativePath: string): string => {
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // Используем переменную окружения для API базы
  const API_BASE = import.meta.env.VITE_API_URL || '/api';
  
  // Если API_BASE содержит полный URL (например, http://localhost:3000/api)
  if (API_BASE.startsWith('http')) {
    const baseUrl = API_BASE.replace('/api', '');
    return `${baseUrl}/api/files${relativePath}`;
  }
  
  // Если относительный путь, используем текущий origin
  return `${window.location.origin}/api/files${relativePath}`;
};

// Вспомогательная функция для получения токена
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Вспомогательная функция для FormData запросов
const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
    // Content-Type не указываем для FormData - браузер установит автоматически
  };
};

// ========== ОСНОВНЫЕ CRUD ОПЕРАЦИИ ==========

export const fetchTechCards = async (filters?: TechCardFilters): Promise<TechCard[]> => {
  let url = `${API_BASE}/techcards`;
  
  // 🆕 Добавляем поддержку фильтров
  if (filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const response = await fetch(url, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// ✅ ОБНОВЛЕНО: Автоматическое логирование при просмотре
export const fetchTechCardById = async (id: string): Promise<TechCard> => {
  const response = await fetch(`${API_BASE}/techcards/${id}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
  // Примечание: сервер автоматически логирует этот просмотр в TechCardAccess
};

// ✅ ОБНОВЛЕНО: Создание техкарты с новыми полями
export const createTechCard = async (data: CreateTechCardData): Promise<TechCard> => {
  const response = await fetch(`${API_BASE}/techcards`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...data,
      priority: data.priority || 'medium', // Значение по умолчанию
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create tech card');
  }
  return response.json();
};

// ✅ ОБНОВЛЕНО: Обновление техкарты с новыми полями
export const updateTechCard = async (id: string, updates: UpdateTechCardData): Promise<TechCard> => {
  const response = await fetch(`${API_BASE}/techcards/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update tech card');
  }
  return response.json();
};

export const deleteTechCard = async (id: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE}/techcards/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete tech card');
  }
  return response.json();
};

// ========== ОПЕРАЦИИ С ВЫПОЛНЕНИЯМИ ==========

// ✅ УПРОЩЕНО: Добавление выполнения (только количество + установка)
export const addExecution = async (techCardId: string, data: CreateExecutionData): Promise<TechCardExecution> => {
  const response = await fetch(`${API_BASE}/techcards/${techCardId}/executions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add execution');
  }
  return response.json();
  // Примечание: сервер автоматически логирует это как action='work'
};

// ========== ОПЕРАЦИИ С PDF ФАЙЛАМИ ==========

// ✅ ОБНОВЛЕНО: Загрузка PDF файла с автоматическим сохранением размера
export const uploadPdf = async (techCardId: string, file: File): Promise<{ pdfUrl: string; pdfFileSize: number; message: string }> => {
  const formData = new FormData();
  formData.append('pdf', file);

  const response = await fetch(`${API_BASE}/techcards/${techCardId}/upload-pdf`, {
    method: 'POST',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload PDF');
  }
  return response.json();
};

// ✅ LEGACY: Поддержка старого API для обратной совместимости
export const uploadDrawing = async (techCardId: string, file: File): Promise<{ drawingUrl: string; pdfUrl: string }> => {
  const formData = new FormData();
  formData.append('drawing', file);

  const response = await fetch(`${API_BASE}/techcards/${techCardId}/upload-drawing`, {
    method: 'POST',
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload drawing');
  }
  return response.json();
};

// ========== ИСТОРИЯ И АНАЛИТИКА ==========

// ✅ ПОЛУЧЕНИЕ ИСТОРИИ ДОСТУПОВ К ТЕХКАРТЕ
export const fetchTechCardAccesses = async (techCardId: string): Promise<TechCardAccess[]> => {
  const response = await fetch(`${API_BASE}/techcards/${techCardId}/accesses`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tech card accesses');
  }
  return response.json();
};

// ========== НОВЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ПЛАНИРОВАНИЕМ ==========

// 🆕 ОБНОВЛЕНИЕ ПРИОРИТЕТА ТЕХКАРТЫ
export const updateTechCardPriority = async (id: string, priority: TechCardPriority): Promise<TechCard> => {
  return updateTechCard(id, { priority });
};

// 🆕 УСТАНОВКА ПЛАНОВОЙ ДАТЫ ЗАВЕРШЕНИЯ
export const setPlannedEndDate = async (id: string, plannedEndDate: string): Promise<TechCard> => {
  return updateTechCard(id, { plannedEndDate });
};

// 🆕 ЗАВЕРШЕНИЕ ТЕХКАРТЫ (установка фактической даты)
export const completeTechCard = async (id: string): Promise<TechCard> => {
  const now = new Date().toISOString();
  return updateTechCard(id, { 
    actualEndDate: now,
    status: 'archived'
  });
};

// 🆕 ДОБАВЛЕНИЕ ЗАМЕТКИ К ТЕХКАРТЕ
export const addNoteToTechCard = async (id: string, note: string): Promise<TechCard> => {
  const techCard = await fetchTechCardById(id);
  const existingNotes = techCard.notes || '';
  const timestamp = new Date().toLocaleString('ru-RU');
  const newNote = `[${timestamp}] ${note}`;
  const updatedNotes = existingNotes 
    ? `${existingNotes}\n${newNote}`
    : newNote;
  
  return updateTechCard(id, { notes: updatedNotes });
};

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

export const updateTechCardStatus = async (id: string, status: TechCardStatus): Promise<TechCard> => {
  return updateTechCard(id, { status });
};

export const getTechCardsByStatus = async (status: TechCardStatus): Promise<TechCard[]> => {
  return fetchTechCards({ status });
};

// 🆕 ПОЛУЧЕНИЕ ТЕХКАРТ ПО ПРИОРИТЕТУ
export const getTechCardsByPriority = async (priority: TechCardPriority): Promise<TechCard[]> => {
  return fetchTechCards({ priority });
};

// 🆕 ПОЛУЧЕНИЕ ПРОСРОЧЕННЫХ ТЕХКАРТ
export const getOverdueTechCards = async (): Promise<TechCard[]> => {
  const allCards = await fetchTechCards();
  const now = new Date();
  
  return allCards.filter(card => 
    card.plannedEndDate && 
    new Date(card.plannedEndDate) < now && 
    card.status === 'active' && 
    !card.actualEndDate
  );
};

// ✅ ПОЛУЧЕНИЕ ПРОГРЕССА ВЫПОЛНЕНИЯ ТЕХКАРТЫ
export const getTechCardProgress = (techCard: TechCard): number => {
  if (techCard.quantity === 0) return 0;
  return Math.round((techCard.totalProducedQuantity / techCard.quantity) * 100);
};

// 🆕 ПРОВЕРКА ПРОСРОЧКИ ТЕХКАРТЫ
export const isTechCardOverdue = (techCard: TechCard): boolean => {
  if (!techCard.plannedEndDate || techCard.actualEndDate || techCard.status !== 'active') {
    return false;
  }
  return new Date(techCard.plannedEndDate) < new Date();
};

// 🆕 ПОЛУЧЕНИЕ ДНЕЙ ДО ДЕДЛАЙНА
export const getDaysToDeadline = (techCard: TechCard): number | null => {
  if (!techCard.plannedEndDate || techCard.actualEndDate) return null;
  
  const now = new Date();
  const deadline = new Date(techCard.plannedEndDate);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// 🆕 ФОРМАТИРОВАНИЕ РАЗМЕРА ФАЙЛА
export const formatFileSize = (sizeInBytes?: number): string => {
  if (!sizeInBytes) return 'Неизвестно';
  
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let size = sizeInBytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// ✅ ПОДСЧЕТ УНИКАЛЬНЫХ ОПЕРАТОРОВ РАБОТАВШИХ С ТЕХКАРТОЙ
export const getUniqueOperatorsCount = (techCard: TechCard): number => {
  if (!techCard.executions) return 0;
  const uniqueOperators = new Set(techCard.executions.map(exec => exec.executedById));
  return uniqueOperators.size;
};

// ✅ ПОЛУЧЕНИЕ ПОСЛЕДНЕЙ АКТИВНОСТИ ПО ТЕХКАРТЕ
export const getLastActivity = (techCard: TechCard): string | null => {
  if (!techCard.executions || techCard.executions.length === 0) return null;
  
  const lastExecution = techCard.executions
    .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())[0];
  
  return lastExecution.executedAt;
};

// 🆕 ПОЛУЧЕНИЕ ЦВЕТА ПРИОРИТЕТА ДЛЯ UI
export const getPriorityColor = (priority: TechCardPriority): string => {
  const colors = {
    low: '#10b981',      // green-500
    medium: '#f59e0b',   // amber-500  
    high: '#f97316',     // orange-500
    urgent: '#ef4444'    // red-500
  };
  return colors[priority];
};

// 🆕 ПОЛУЧЕНИЕ СТАТИСТИКИ ПО ТЕХКАРТАМ
export const getTechCardsStats = async () => {
  const allCards = await fetchTechCards();
  
  return {
    total: allCards.length,
    byStatus: {
      draft: allCards.filter(c => c.status === 'draft').length,
      active: allCards.filter(c => c.status === 'active').length,
      archived: allCards.filter(c => c.status === 'archived').length,
    },
    byPriority: {
      low: allCards.filter(c => c.priority === 'low').length,
      medium: allCards.filter(c => c.priority === 'medium').length,
      high: allCards.filter(c => c.priority === 'high').length,
      urgent: allCards.filter(c => c.priority === 'urgent').length,
    },
    overdue: allCards.filter(c => isTechCardOverdue(c)).length,
    totalProduced: allCards.reduce((sum, c) => sum + c.totalProducedQuantity, 0),
    totalPlanned: allCards.reduce((sum, c) => sum + c.quantity, 0),
  };
};

// Экспорт всех типов для использования в компонентах
export type { 
  TechCard, 
  TechCardExecution, 
  TechCardAccess,
  CreateTechCardData, 
  CreateExecutionData,
  UpdateTechCardData,
  TechCardFilters,
};
;

