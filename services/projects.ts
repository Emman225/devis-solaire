import { Project } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface ProjectResponse {
    success: boolean;
    message: string;
    data: {
        projects: Project[];
        pagination: any;
    };
    status_code: number;
}

export interface SingleProjectResponse {
    success: boolean;
    message: string;
    data: Project;
    status_code: number;
}

const getHeaders = () => {
    const token = localStorage.getItem('lynays_token');
    return {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const projectService = {
    getAll: async (): Promise<Project[]> => {
        try {
            const response = await fetch(`${API_URL}/projects`, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des projets');
            }

            const data: ProjectResponse = await response.json();
            return data.data.projects || [];
        } catch (error) {
            console.error('Fetch projects error:', error);
            throw error;
        }
    },

    getOne: async (id: number): Promise<Project> => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du projet');
            }

            const data: SingleProjectResponse = await response.json();
            return data.data;
        } catch (error) {
            console.error('Fetch project error:', error);
            throw error;
        }
    },

    create: async (projectData: Partial<Project>, imageFile?: File): Promise<Project> => {
        try {
            const token = localStorage.getItem('lynays_token');
            let headers: HeadersInit = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            let body: any;

            if (imageFile) {
                // Use FormData for file upload
                const formData = new FormData();
                if (projectData.title) formData.append('title', projectData.title);
                if (projectData.category) formData.append('category', projectData.category);
                if (projectData.capacity) formData.append('capacity', projectData.capacity);
                if (projectData.location) formData.append('location', projectData.location);
                if (projectData.date) formData.append('date', projectData.date);
                if (projectData.description) formData.append('description', projectData.description);

                formData.append('image', imageFile);
                body = formData;
                // Don't set Content-Type for FormData
            } else {
                // Standard JSON
                headers = {
                    ...headers,
                    'Content-Type': 'application/json'
                };
                body = JSON.stringify(projectData);
            }

            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers,
                body,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création du projet');
            }

            return data.data;
        } catch (error) {
            console.error('Create project error:', error);
            throw error;
        }
    },

    update: async (id: number, projectData: Partial<Project>, imageFile?: File): Promise<Project> => {
        try {
            const token = localStorage.getItem('lynays_token');
            let headers: HeadersInit = {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            let method = 'PUT';
            let body: any;

            if (imageFile) {
                // Use FormData for file upload with Laravel trick
                method = 'POST';
                const formData = new FormData();
                formData.append('_method', 'PUT');

                if (projectData.title) formData.append('title', projectData.title);
                if (projectData.category) formData.append('category', projectData.category);
                if (projectData.capacity) formData.append('capacity', projectData.capacity);
                if (projectData.location) formData.append('location', projectData.location);
                if (projectData.date) formData.append('date', projectData.date);
                if (projectData.description) formData.append('description', projectData.description);

                formData.append('image', imageFile);
                body = formData;
                // Don't set Content-Type for FormData
            } else {
                // Standard JSON
                headers = {
                    ...headers,
                    'Content-Type': 'application/json'
                };
                body = JSON.stringify(projectData);
            }

            const response = await fetch(`${API_URL}/projects/${id}`, {
                method,
                headers,
                body,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour du projet');
            }

            return data.data;
        } catch (error) {
            console.error('Update project error:', error);
            throw error;
        }
    },

    delete: async (id: number): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du projet');
            }
        } catch (error) {
            console.error('Delete project error:', error);
            throw error;
        }
    }
};
