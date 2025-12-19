import { User, UserFormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface UserResponse {
    success: boolean;
    message: string;
    data: {
        users: User[];
        pagination: any;
    };
    status_code: number;
}

export interface SingleUserResponse {
    success: boolean;
    message: string;
    data: User;
    status_code: number;
}

const getHeaders = () => {
    const token = localStorage.getItem('lynays_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const userService = {
    getAll: async (): Promise<User[]> => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des utilisateurs');
            }

            const data: UserResponse = await response.json();
            return data.data.users;
        } catch (error) {
            console.error('Fetch users error:', error);
            throw error;
        }
    },

    getOne: async (id: string): Promise<User> => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'GET',
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'utilisateur');
            }

            const data: SingleUserResponse = await response.json();
            return data.data;
        } catch (error) {
            console.error('Fetch user error:', error);
            throw error;
        }
    },

    create: async (userData: UserFormData): Promise<User> => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur');
            }

            return data.data;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },

    update: async (id: string, userData: Partial<UserFormData>, avatarFile?: File): Promise<User> => {
        try {
            const token = localStorage.getItem('lynays_token');
            // Headers for JSON (default)
            let headers: HeadersInit = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            let method = 'PUT';
            let body: any;

            if (avatarFile) {
                // Formatting for File Upload (Multipart)
                method = 'POST'; // Laravel trick
                const formData = new FormData();
                formData.append('_method', 'PUT');

                if (userData.name) formData.append('name', userData.name);
                if (userData.email) formData.append('email', userData.email);
                if (userData.phone) formData.append('phone', userData.phone);
                if (userData.role) formData.append('role', userData.role);

                formData.append('avatarUrl', avatarFile);

                // Do NOT set Content-Type for FormData, browser does it
                body = formData;
            } else {
                // Standard JSON Update
                headers = {
                    ...headers,
                    'Content-Type': 'application/json'
                };
                body = JSON.stringify(userData);
            }

            const response = await fetch(`${API_URL}/users/${id}`, {
                method,
                headers,
                body,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour de l\'utilisateur');
            }

            return data.data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de la suppression de l\'utilisateur');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    },

    changePassword: async (userId: string, data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<any> => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors du changement de mot de passe');
            }

            return responseData;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }
};
