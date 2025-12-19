import { ContactMessage, ContactMessagePayload } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('lynays_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const contactService = {
    sendMessage: async (data: ContactMessagePayload): Promise<ContactMessage> => {
        try {
            const response = await fetch(`${API_URL}/contact-messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors de l\'envoi du message');
            }

            return responseData.data;
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    },

    getMessages: async (status?: string): Promise<ContactMessage[]> => {
        try {
            const url = status
                ? `${API_URL}/contact-messages?status=${status}`
                : `${API_URL}/contact-messages`;

            const response = await fetch(url, {
                headers: getAuthHeaders(),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors de la récupération des messages');
            }

            // API returns paginated data inside "data" key: { data: { messages: [...] } }
            // Or sometimes simple list. Based on user prompt: data.data.messages
            return responseData.data.messages || [];
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    },

    deleteMessage: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/contact-messages/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors de la suppression du message');
            }
        } catch (error) {
            console.error('Delete message error:', error);
            throw error;
        }
    },

    markAsRead: async (id: string): Promise<ContactMessage> => {
        try {
            const response = await fetch(`${API_URL}/contact-messages/${id}/mark-as-read`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors de la mise à jour du message');
            }

            return responseData.data;
        } catch (error) {
            console.error('Mark as read error:', error);
            throw error;
        }
    }
};
