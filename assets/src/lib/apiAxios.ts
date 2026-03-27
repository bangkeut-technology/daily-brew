import axios from 'axios';

const locale = () => sessionStorage.getItem('locale') || 'en';

export const apiAxios = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

apiAxios.interceptors.request.use((config) => {
    if (config.url && !config.url.startsWith('/checkin') && !config.url.startsWith('/webhooks')) {
        config.url = `/${locale()}${config.url}`;
    }
    return config;
});

apiAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (
            status === 401 &&
            ['Invalid JWT Token', 'Expired JWT Token', 'JWT Token not found'].includes(message) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                await axios.post('/api/v1/token/refresh', {}, { withCredentials: true });
                return apiAxios(originalRequest);
            } catch {
                window.location.href = '/sign-in';
                return Promise.reject(error);
            }
        }

        if (status === 401) {
            window.location.href = '/sign-in';
        }

        return Promise.reject(error);
    },
);

export default apiAxios;
