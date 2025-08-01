// src/shared/api/assignmentsApi.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchAssignments = async () => {
  const response = await fetch(`${BASE_URL}/assignments`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const fetchAssignmentById = async (id: string) => {
  const response = await fetch(`${BASE_URL}/assignments/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createAssignment = async (data: object) => {
  const response = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create assignment');
  }
  return response.json();
};

export const updateAssignment = async (id: string, updates: object) => {
  const response = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update assignment');
  }
  return response.json();
};

export const deleteAssignment = async (id: string) => {
  const response = await fetch(`${BASE_URL}/assignments/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete assignment');
  }
  return response.json();
};
