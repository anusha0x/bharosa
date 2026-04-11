const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:8000';

// Generic fetch wrapper with auth token support
const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('bharosa_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
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
