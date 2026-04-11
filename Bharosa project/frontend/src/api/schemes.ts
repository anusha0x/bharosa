import { API_BASE_URL, ML_BASE_URL, apiFetch } from './config';

export const getAllSchemes = async (params?: {
  category?: string;
  state?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.state) query.set('state', params.state);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  return apiFetch(`${API_BASE_URL}/schemes?${query.toString()}`);
};

export const getSchemeById = async (id: string) => {
  return apiFetch(`${API_BASE_URL}/schemes/${id}`);
};

export const getEligibleSchemes = async (studentId: string) => {
  return apiFetch(`${API_BASE_URL}/schemes/eligible/${studentId}`);
};

// ML-powered scheme ranking
export const getRankedSchemes = async (userProfile: {
  user_id: string;
  income: number;
  state: string;
  category: string;
  academic_year: number;
  has_caste_cert: number;
  has_income_cert: number;
  has_marksheet: number;
}) => {
  const res = await fetch(`${ML_BASE_URL}/ml/rank-schemes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userProfile),
  });
  if (!res.ok) throw new Error('ML service unavailable');
  return res.json();
};
