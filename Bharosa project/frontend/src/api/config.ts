// @ts-nocheck

// Use "as any" to stop the 'env' red lines
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';
export const ML_BASE_URL = (import.meta as any).env.VITE_ML_URL || 'http://localhost:8000';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('bharosa_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export { API_BASE_URL, ML_BASE_URL, apiFetch };
