import { SystemSettings } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('lynays_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const settingsService = {
    getSettings: async (): Promise<SystemSettings> => {
        try {
            const response = await fetch(`${API_URL}/system-settings`, {
                headers: getHeaders(),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la récupération des paramètres');
            }

            return data.data;
        } catch (error) {
            console.error('Get settings error:', error);
            throw error;
        }
    },

    updateSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
        try {
            const response = await fetch(`${API_URL}/system-settings`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour des paramètres');
            }

            return data.data;
        } catch (error) {
            console.error('Update settings error:', error);
            throw error;
        }
    }
};
