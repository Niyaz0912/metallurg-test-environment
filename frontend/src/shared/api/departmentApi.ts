// src/shared/api/departmentApi.ts
export const fetchDepartment = async (id: string) => {
  const response = await fetch(`http://localhost:3001/api/departments/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const updateProductionTask = async (taskId: number, updates: object) => {
  const response = await fetch(`/api/departments/production/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
};