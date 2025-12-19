import { CollectionRequest, Equipment } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface ApiCollectionRequest {
    id: string;
    status: 'PENDING' | 'PROCESSED' | 'REJECTED';
    submittedAt: string;
    step: number;
    personalInfo: {
        email: string;
        phone: string;
        address: string;
        lastName: string;
        firstName: string;
    };
    consumptionProfile: 'INVOICE' | 'EQUIPMENT' | null;
    invoices: string[] | null;
    equipmentList: Equipment[];
    installationType: 'ROOF' | 'GROUND' | null;
    roofType?: 'SHEET' | 'SLAB' | 'SLATE' | 'STEEL_TRAY' | 'TILES';
    location: string;
    additional_info?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiCreateCollectionRequest {
    status: 'PENDING' | 'PROCESSED' | 'REJECTED';
    step: number;
    personalInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
    };
    consumptionProfile: 'INVOICE' | 'EQUIPMENT' | null;
    invoices: string[];
    equipmentList: Equipment[];
    installationType: 'ROOF' | 'GROUND' | null;
    roofType?: 'SHEET' | 'SLAB' | 'SLATE' | 'STEEL_TRAY' | 'TILES';
    location: string;
    additional_info?: string;
}

export interface CollectionResponse {
    success: boolean;
    message: string;
    data: {
        collectionRequests: ApiCollectionRequest[];
        pagination: any;
    };
    status_code: number;
}

const mapApiToCollectionRequest = (apiItem: ApiCollectionRequest): CollectionRequest => {
    // Location is just the city/commune now
    let city = apiItem.location;
    // additionalInfo comes from the separate field, fallback to empty string
    // Check both snake_case and camelCase to be safe against backend serialization differences
    let additionalInfo = apiItem.additional_info || (apiItem as any).additionalInfo || '';

    // Always clean the city string if it contains separators, even if we already have additionalInfo
    if (apiItem.location) {
        if (apiItem.location.includes('|')) {
            const parts = apiItem.location.split('|');
            city = parts[0].trim();
            // Only overwrite additionalInfo if it was empty, otherwise we prefer the dedicated field
            if (!additionalInfo) {
                additionalInfo = parts.slice(1).join('|').trim();
            }
        } else if (apiItem.location.includes(',')) {
            const parts = apiItem.location.split(',');
            city = parts[0].trim();
            if (!additionalInfo) {
                additionalInfo = parts.slice(1).join(',').trim();
            }
        }
    }

    return {
        id: apiItem.id,
        step: apiItem.step,
        personalInfo: {
            name: apiItem.personalInfo.lastName,
            firstName: apiItem.personalInfo.firstName,
            email: apiItem.personalInfo.email,
            phone: apiItem.personalInfo.phone,
        },
        consumptionProfile: apiItem.consumptionProfile,
        invoices: apiItem.invoices || [],
        equipmentList: apiItem.equipmentList || [],
        installationType: apiItem.installationType,
        roofType: apiItem.roofType,
        location: city, // Now a string
        additionalInfo: additionalInfo, // Now a root property
        status: apiItem.status,
        submittedAt: apiItem.submittedAt ? new Date(apiItem.submittedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
};

export const collectionService = {
    getAll: async (): Promise<CollectionRequest[]> => {
        try {
            const token = localStorage.getItem('lynays_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/collection-requests`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données');
            }

            const data: CollectionResponse = await response.json();
            return data.data.collectionRequests.map(mapApiToCollectionRequest);
        } catch (error) {
            console.error('Fetch collections error:', error);
            throw error;
        }
    },

    save: async (data: Partial<CollectionRequest>): Promise<any> => {
        try {
            const token = localStorage.getItem('lynays_token');
            const headers: HeadersInit = {
                'Accept': 'application/json',
                // 'Content-Type': 'multipart/form-data', // Let browser set this
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const formData = new FormData();

            // Determine operation type
            const isUpdate = !!data.id;
            const url = isUpdate
                ? `${API_URL}/collection-requests/${data.id}`
                : `${API_URL}/collection-requests`;

            // Laravel requires POST with _method=PUT for multipart updates
            if (isUpdate) {
                formData.append('_method', 'PUT');
            }

            // 1. Basic Fields
            formData.append('status', data.status || 'PENDING');
            if (data.submittedAt) formData.append('submittedAt', data.submittedAt);
            if (!isUpdate && !data.submittedAt) formData.append('submittedAt', new Date().toISOString());

            formData.append('step', (data.step || 1).toString());
            formData.append('consumptionProfile', data.consumptionProfile || '');
            formData.append('installationType', data.installationType || '');

            // 2. Location & Additional Info
            const city = typeof data.location === 'string' ? data.location : '';
            const additionalInfo = data.additionalInfo || '';

            // Concatenate for backend compatibility using a safer separator
            const locationStr = additionalInfo ? `${city} | ${additionalInfo}` : city;

            formData.append('location', locationStr);
            formData.append('additional_info', additionalInfo);

            // 3. Nested Objects (personalInfo)
            if (data.personalInfo) {
                formData.append('personalInfo[firstName]', data.personalInfo.firstName || '');
                formData.append('personalInfo[lastName]', data.personalInfo.name || ''); // Map name backend lastName
                formData.append('personalInfo[email]', data.personalInfo.email || '');
                formData.append('personalInfo[phone]', data.personalInfo.phone || '');
                formData.append('personalInfo[address]', city); // Using city as address for now
            }

            // 4. Roof Type
            if (data.installationType === 'ROOF' && data.roofType) {
                formData.append('roofType', data.roofType);
            }

            // 5. Equipment List (Complex object array)
            if (data.equipmentList && data.equipmentList.length > 0) {
                data.equipmentList.forEach((eq, index) => {
                    formData.append(`equipmentList[${index}][id]`, eq.id);
                    formData.append(`equipmentList[${index}][type]`, eq.type);
                    if (eq.name) formData.append(`equipmentList[${index}][name]`, eq.name);
                    formData.append(`equipmentList[${index}][quantity]`, eq.quantity.toString());
                    formData.append(`equipmentList[${index}][powerWatts]`, eq.powerWatts.toString());
                    formData.append(`equipmentList[${index}][hoursPerDay]`, eq.hoursPerDay.toString());
                });
            }

            // 6. Files (The Critical Part)
            if (data.invoices && Array.isArray(data.invoices)) {
                data.invoices.forEach((file) => {
                    if (file instanceof File) {
                        formData.append('invoices[]', file);
                    }
                });
            }

            const response = await fetch(url, {
                method: 'POST', // Always POST for Laravel Multipart
                headers,
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error('API Error Details:', JSON.stringify(errData, null, 2));
                const error = new Error(errData.message || 'Erreur lors de la sauvegarde');
                (error as any).errors = errData.errors;
                throw error;
            }

            return await response.json();
        } catch (error) {
            console.error('Save collection error:', error);
            throw error;
        }
    },

    deleteCollectionRequest: async (id: string): Promise<any> => {
        try {
            const token = localStorage.getItem('lynays_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/collection-requests/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Erreur lors de la suppression');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete collection error:', error);
            throw error;
        }
    }
};
