import { API_URL } from './config';

export const getUserInvitations = async (userId: string) => {
  const response = await fetch(`${API_URL}/eventInvitations/user/${userId}`);
  return await response.json();
};
