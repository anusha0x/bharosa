import { API_BASE_URL, apiFetch } from './config';

export const applyToScheme = async (schemeId: string) => {
  return apiFetch(`${API_BASE_URL}/applications/apply`, {
    method: 'POST',
    body: JSON.stringify({ schemeId }),
  });
};

export const getMyApplications = async () => {
  return apiFetch(`${API_BASE_URL}/applications/my`);
};

export const getApplicationById = async (id: string) => {
  return apiFetch(`${API_BASE_URL}/applications/${id}`);
};

export const getApplicationStatus = async (applicationId: string) => {
  return apiFetch(`${API_BASE_URL}/applications/status/${applicationId}`);
};
