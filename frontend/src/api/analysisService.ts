import apiClient from './apiClient';

// Analysis Job Interfaces
export interface AnalysisJob {
    id: number;
    user: string;
    data_file: number;
    analysis_type: string;
    backend: string;
    parameters: Record<string, any>;
    status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
    error_message?: string;
    submitted_at: string;
    started_at?: string;
    finished_at?: string;
    task_id?: string;
}

export interface CreateAnalysisJob {
    name: string;
    description?: string;
    data_file: string;
    parameter_set: string;
    analysis_type: string;
}

// Parameter Set Interfaces
export interface ParameterSet {
    id: number;
    name: string;
    user: string;
    parameters: Record<string, any>;
    analysis_type: string;
    is_public: boolean;
    created_at: string;
}

export interface CreateParameterSet {
    name: string;
    parameters: Record<string, any>;
    analysis_type: string;
    is_default?: boolean;
}

// Analysis Result Interface
export interface AnalysisResult {
    id: number;
    job: number;
    result_type: string;
    file_path?: string;
    content?: Record<string, any>;
    created_at: string;
}

// Analysis Service
const analysisService = {
    // Analysis Jobs
    getAnalysisJobs: async (): Promise<AnalysisJob[]> => {
        const response = await apiClient.get('analysis/');
        return response.data;
    },

    getAnalysisJob: async (id: string): Promise<AnalysisJob> => {
        const response = await apiClient.get(`analysis/${id}/`);
        return response.data;
    },

    createAnalysisJob: async (job: CreateAnalysisJob): Promise<AnalysisJob> => {
        const response = await apiClient.post('analysis/', job);
        return response.data;
    },

    cancelAnalysisJob: async (id: string): Promise<void> => {
        await apiClient.post(`analysis/${id}/cancel/`);
    },

    // Parameter Sets
    getParameterSets: async (): Promise<ParameterSet[]> => {
        const response = await apiClient.get('parametersets/');
        return response.data;
    },

    getParameterSet: async (id: string): Promise<ParameterSet> => {
        const response = await apiClient.get(`parametersets/${id}/`);
        return response.data;
    },

    createParameterSet: async (parameterSet: CreateParameterSet): Promise<ParameterSet> => {
        const response = await apiClient.post('parametersets/', parameterSet);
        return response.data;
    },

    updateParameterSet: async (id: string, parameterSet: Partial<ParameterSet>): Promise<ParameterSet> => {
        const response = await apiClient.patch(`parametersets/${id}/`, parameterSet);
        return response.data;
    },

    deleteParameterSet: async (id: string): Promise<void> => {
        await apiClient.delete(`parametersets/${id}/`);
    },

    // Analysis Results
    getAnalysisResults: async (): Promise<AnalysisResult[]> => {
        const response = await apiClient.get('results/');
        return response.data;
    },

    getAnalysisResult: async (id: string): Promise<AnalysisResult> => {
        const response = await apiClient.get(`results/${id}/`);
        return response.data;
    },
};

export default analysisService; 