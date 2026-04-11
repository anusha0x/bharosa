import { API_BASE_URL, apiFetch } from './config';

export const sendChatMessage = async (message: string) => {
  return apiFetch(`${API_BASE_URL}/chatbot/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};
