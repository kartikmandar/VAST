import apiClient from './apiClient';

export interface DataFile {
    id: number;
    user: string;
    name: string;
    file_path: string;
    file_type: string;
    size: number;
    file_size_display?: string;
    metadata: Record<string, any>;
    is_public: boolean;
    uploaded_at: string;
}

export interface DataFileUpload {
    name: string;
    file_path: File;
    is_public: boolean;
    metadata?: Record<string, any>;
}

const dataService = {
    // Get all data files
    getDataFiles: async (): Promise<DataFile[]> => {
        console.log('Making API request to /data/');
        try {
            const response = await apiClient.get('data/');
            console.log('API response:', response);
            return response.data;
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    },

    // Get a specific data file by ID
    getDataFile: async (id: string): Promise<DataFile> => {
        const response = await apiClient.get(`data/${id}/`);
        return response.data;
    },

    // Upload a new data file
    uploadDataFile: async (dataFile: DataFileUpload): Promise<DataFile> => {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('name', dataFile.name);
        formData.append('file_path', dataFile.file_path);
        formData.append('is_public', String(dataFile.is_public));

        if (dataFile.metadata) {
            formData.append('metadata', JSON.stringify(dataFile.metadata));
        }

        const response = await apiClient.post('data/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Update a data file
    updateDataFile: async (id: string, dataFile: Partial<DataFile>): Promise<DataFile> => {
        const response = await apiClient.patch(`data/${id}/`, dataFile);
        return response.data;
    },

    // Delete a data file
    deleteDataFile: async (id: string): Promise<void> => {
        await apiClient.delete(`data/${id}/`);
    },

    // Download a data file
    downloadDataFile: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(`data/${id}/download/`, {
            responseType: 'blob',
        });
        return response.data;
    },
};

export default dataService; 