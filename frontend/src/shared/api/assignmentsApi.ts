// frontend/src/shared/api/assignmentsApi.ts
interface CreateAssignmentData {
  operatorId: number;
  shiftDate: string;
  shiftType: 'day' | 'night';
  taskDescription: string;
  machineNumber: string;
  detailName: string;
  customerName: string;
  plannedQuantity: number;
  techCardId: number;
}

interface Assignment {
  id: number;
  operatorId: number;
  shiftDate: string;
  shiftType: 'day' | 'night';
  taskDescription: string;
  machineNumber: string;
  detailName: string;
  customerName: string;
  plannedQuantity: number;
  actualQuantity: number | null;
  techCardId: number;
  status: 'assigned' | 'completed';
  createdAt: string;
  updatedAt: string;
  operator?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  techCard?: {
    id: number;
    productName: string;
    description: string;
  };
}

const API_BASE_URL = '/api/assignments';

// Получить токен из localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Создать заголовки с авторизацией
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Получить список заданий
export const fetchAssignments = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Ошибка загрузки заданий:', error);
    throw error;
  }
};

// Создать новое задание
export const createAssignment = async (assignmentData: CreateAssignmentData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания задания:', error);
    throw error;
  }
};

// Получить задание по ID
export const fetchAssignmentById = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки задания:', error);
    throw error;
  }
};

// Обновить задание
export const updateAssignment = async (id: number, updateData: Partial<Assignment>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка обновления задания:', error);
    throw error;
  }
};

// Удалить задание
export const deleteAssignment = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка удаления задания:', error);
    throw error;
  }
};

// Отметить задание как выполненное
export const completeAssignment = async (id: number, actualQuantity: number) => {
  return updateAssignment(id, {
    status: 'completed',
    actualQuantity: actualQuantity
  });
};

export type { Assignment, CreateAssignmentData };
