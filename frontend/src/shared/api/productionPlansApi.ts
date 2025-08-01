const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchProductionPlans = async () => {
  const response = await fetch(`${BASE_URL}/productionPlans`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchProductionPlanById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/productionPlans/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createProductionPlan = async (data: object) => {
  const response = await fetch(`${BASE_URL}/productionPlans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create production plan');
  }
  return response.json();
};

export const updateProductionPlan = async (id: string, updates: object) => {
  const response = await fetch(`${BASE_URL}/productionPlans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update production plan');
  }
  return response.json();
};

export const deleteProductionPlan = async (id: string) => {
  const response = await fetch(`${BASE_URL}/productionPlans/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete production plan');
  }
  return response.json();
};
