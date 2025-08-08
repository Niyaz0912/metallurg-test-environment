const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Типы данных
interface TechCard {
  id: number;
  productName: string;
  partNumber?: string;
  description?: string;
  drawingUrl?: string;
  specifications?: any;
  productionStages?: any[];
  estimatedTimePerUnit?: number;
  notes?: string;
  status: 'draft' | 'active' | 'archived';
  version: string;
  totalUsageCount: number;
  totalProducedQuantity: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  executions?: TechCardExecution[];
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

interface CreateTechCardData {
  productName: string;
  partNumber?: string;
  description?: string;
  drawingUrl?: string;
  specifications?: any;
  productionStages?: any[];
  estimatedTimePerUnit?: number;
  notes?: string;
  status?: string; // или конкретный тип: 'active' | 'inactive' | 'draft'
}

interface CreateExecutionData {
  stageName: string;
  quantityProduced: number;
  qualityStatus?: 'OK' | 'NOK';
  qualityComment?: string;
  checkedById?: number;
}

// Вспомогательная функция для получения токена
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ✅ ИСПРАВЛЕНО: Правильный URL и авторизация
export const fetchTechCards = async (): Promise<TechCard[]> => {
  const response = await fetch(`${API_BASE}/techcards`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchTechCardById = async (id: string): Promise<TechCard> => {
  const response = await fetch(`${API_BASE}/techcards/${id}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createTechCard = async (data: CreateTechCardData): Promise<TechCard> => {
  const response = await fetch(`${API_BASE}/techcards`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create tech card');
  }
  return response.json();
};

export const updateTechCard = async (id: string, updates: Partial<CreateTechCardData>): Promise<TechCard> => {
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

// ✅ НОВАЯ ФУНКЦИЯ: Добавление выполнения этапа
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
};

// ✅ ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ для удобства
export const updateTechCardStatus = async (id: string, status: 'draft' | 'active' | 'archived'): Promise<TechCard> => {
  return updateTechCard(id, { status });
};

export const getTechCardsByStatus = async (status: 'draft' | 'active' | 'archived'): Promise<TechCard[]> => {
  const allCards = await fetchTechCards();
  return allCards.filter(card => card.status === status);
};

// Загрузка чертежа
export const uploadDrawing = async (techCardId: string, file: File): Promise<{ drawingUrl: string }> => {
  const formData = new FormData();
  formData.append('drawing', file);

  const response = await fetch(`${API_BASE}/techcards/${techCardId}/upload-drawing`, {
    method: 'POST',
    headers: getAuthHeaders(), // без Content-Type - FormData сам установит
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload drawing');
  }
  return response.json();
};
