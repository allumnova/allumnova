import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Auth Token and College ID
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const collegeId = localStorage.getItem('activeCollegeId') || sessionStorage.getItem('activeCollegeId');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (collegeId) {
        config.headers['X-College-ID'] = collegeId;
    }

    return config;
});

// Response Interceptor: Handle Unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn(`Auth Error (${error.response.status}) at: ${error.config?.url}`);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            // Don't auto-logout if using demo token
            if (token && token !== 'demo_token') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
