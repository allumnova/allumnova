import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Allumnova Network Nexus (Mobile Port)
// Synchronized with https://allumnova.cloud

// Environment configuration for Omnichannel Testing
import { Platform } from 'react-native';

const getBaseURL = () => {
    // Priority: Cloud Backend (requested by user)
    return 'https://allumnova.cloud/api';
    
    // For future reference: Local development logic
    /*
    if (__DEV__) {
        const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
        return `http://${host}:5000/api`;
    }
    return 'https://allumnova.cloud/api';
    */
};

const api = axios.create({
    baseURL: getBaseURL(), 
    headers: {
        'Content-Type': 'application/json',
    },
});

import { useAuthStore } from '../store/useAuthStore';

// Request Interceptor: Add Auth Token and College ID
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { token, activeCollegeId } = useAuthStore.getState();
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (activeCollegeId) {
        config.headers['X-College-ID'] = activeCollegeId;
    }

    return config;
});

// Response Interceptor: Handle Unauthorized errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const data = error.response.data;
            const skipLogoutCodes = ['COLLEGE_UNVERIFIED', 'UNVERIFIED'];
            
            if (skipLogoutCodes.includes(data.code)) {
                console.info(`[Mobile Auth] Staying logged in for status: ${data.code}`);
                return Promise.reject(error);
            }

            console.warn(`[Mobile Network] Auth Error (${error.response.status}) at: ${error.config?.url}`);
            
            // Auto-logout logic (mirroring web)
            const token = useAuthStore.getState().token;
            // Note: In mobile, the user object is stored in the store
            const user = useAuthStore.getState().user;

            // Don't auto-logout if using demo token or if user is an admin
            if (token && token !== 'demo_token' && user?.role !== 'ADMIN') {
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
