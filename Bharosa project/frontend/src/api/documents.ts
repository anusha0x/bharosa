import { API_BASE_URL } from './config';

export const uploadDocument = async (docType: string, file: File) => {
  const token = localStorage.getItem('bharosa_token');
  const formData = new FormData();
  formData.append('document', file);
  formData.append('docType', docType);

  const res = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
};

export const getMyDocuments = async () => {
  const token = localStorage.getItem('bharosa_token');
  const res = await fetch(`${API_BASE_URL}/documents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch documents');
  return data;
};
