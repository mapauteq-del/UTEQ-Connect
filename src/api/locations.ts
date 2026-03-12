import { API_URL } from './config';

export interface Location {
    _id: string;
    nombre: string;
    posicion: {
        latitude: number;
        longitude: number;
    };
}

export const getLocations = async () => {
    try {
        const response = await fetch(`${API_URL}/locations`);
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};