import { API_URL } from './config';

export interface Event {
  _id: string;
  nombre: string;
  descripcion?: string;
  fecha?: string;
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}/events`);
    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      return [];
    }

  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};
