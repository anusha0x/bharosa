import { API_BASE_URL, apiFetch } from './config';

export const sendOTP = async (mobile: string) => {
  return apiFetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    body: JSON.stringify({ mobile }),
  });
};

export const verifyOTP = async (mobile: string, otp: string) => {
  return apiFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ mobile, otp }),
  });
};

export const getAuthProfile = async () => {
  return apiFetch(`${API_BASE_URL}/auth/profile`);
};

export const logout = () => {
  localStorage.removeItem('bharosa_token');
  localStorage.removeItem('bharosa_user');
};
