import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        access_token: string;
        token_type: string;
        expires_in: number;
        user: User;
    };
    status_code: number;
}

export interface AuthError {
    message: string;
    status: number;
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    message: data.message || 'Erreur lors de la connexion',
                    status: response.status
                };
            }

            return data;
        } catch (error: any) {
            if (error.status) {
                throw error;
            }
            throw {
                message: 'Impossible de joindre le serveur',
                status: 500
            };
        }
    },

    refresh: async (): Promise<LoginResponse> => {
        try {
            const token = localStorage.getItem('lynays_token');
            if (!token) throw { message: 'No token found', status: 401 };

            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    message: data.message || 'Session expirée',
                    status: response.status
                };
            }

            return data;
        } catch (error: any) {
            if (error.status) {
                throw error;
            }
            throw {
                message: 'Impossible de rafraîchir la session',
                status: 500
            };
        }
    },

    logout: async (): Promise<void> => {
        try {
            const token = localStorage.getItem('lynays_token');
            if (token) {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
            }
        } catch (error) {
            console.warn('Logout API call failed', error);
            // We suppress error here because we want to clear local state regardless of API success
        }
    }
};
