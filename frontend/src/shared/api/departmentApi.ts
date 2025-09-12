// src/shared/api/departmentApi.ts
export const fetchDepartments = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/departments', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
