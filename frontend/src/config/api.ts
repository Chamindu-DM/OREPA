export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://orepa.lk/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            PROFILE: '/auth/profile',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
        },
        ADMIN: {
            LOGIN: '/admin/login',
        },
    },
};

export const getApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;
