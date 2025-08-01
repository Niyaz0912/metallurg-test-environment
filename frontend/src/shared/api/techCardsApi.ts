const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchTechCards = async () => {
  const response = await fetch(`${BASE_URL}/techCards`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchTechCardById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/techCards/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createTechCard = async (data: object) => {
  const response = await fetch(`${BASE_URL}/techCards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create tech card');
  }
  return response.json();
};

export const updateTechCard = async (id: string, updates: object) => {
  const response = await fetch(`${BASE_URL}/techCards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update tech card');
  }
  return response.json();
};

export const deleteTechCard = async (id: string) => {
  const response = await fetch(`${BASE_URL}/techCards/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete tech card');
  }
  return response.json();
};
