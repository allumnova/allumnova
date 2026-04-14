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
            const data = error.response.data;
            const skipLogoutCodes = ['COLLEGE_UNVERIFIED', 'UNVERIFIED'];
            
            if (skipLogoutCodes.includes(data.code)) {
                console.info(`[Auth] Staying logged in for status: ${data.code}`);
                return Promise.reject(error);
            }

            console.warn(`Auth Error (${error.response.status}) at: ${error.config?.url}`);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            
            // Safety bypass for users on the /pending or /onboarding pages
            const isPendingRoute = window.location.pathname.startsWith('/pending') || window.location.pathname.startsWith('/onboarding');
            
            // Don't auto-logout if on a pending route or using demo token
            // For 401 (Unauthorized), everyone should re-login to fix stale tokens
            if (token && token !== 'demo_token' && (error.response.status === 401 || !isPendingRoute)) {
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
