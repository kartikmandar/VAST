import apiClient from './apiClient';

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface UserProfile {
    user: User;
    organization?: string;
    bio?: string;
    profile_image?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegistrationData {
    username: string;
    email: string;
    password: string;
    password2: string;
    first_name?: string;
    last_name?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

const authService = {
    // User login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post('accounts/login/', credentials);

        // Save token to localStorage
        localStorage.setItem('token', response.data.token);

        return response.data;
    },

    // User registration
    register: async (userData: RegistrationData): Promise<AuthResponse> => {
        const response = await apiClient.post('accounts/register/', userData);

        // Save token to localStorage if registration automatically logs in
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }

        return response.data;
    },

    // User logout
    logout: async (): Promise<void> => {
        try {
            await apiClient.post('accounts/logout/');
        } finally {
            // Always clear token
            localStorage.removeItem('token');
        }
    },

    // Get current user profile
    getCurrentUser: async (): Promise<UserProfile> => {
        const response = await apiClient.get('accounts/profile/');
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiClient.patch('accounts/profile/', profileData);
        return response.data;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },
};

export default authService; 