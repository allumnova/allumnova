import axios from 'axios';

// Allumnova Network Nexus (Mobile Port)
// Synchronized with https://allumnova.cloud

const api = axios.create({
    // Standardizing on the production-grade endpoint for omnichannel synchronization
    baseURL: 'https://allumnova.cloud/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

import { useAuthStore } from '../store/useAuthStore';

// Request Interceptor: Add Auth Token and College ID
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn(`[Mobile Network] Auth Error (${error.response.status}) at: ${error.config?.url}`);
        }
        return Promise.reject(error);
    }
);

export default api;
