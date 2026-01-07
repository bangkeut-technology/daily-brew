import * as defaultAxios from 'axios';
import { joinPaths } from '@tanstack/react-router';
import { AxiosResponse } from 'axios';
import { User } from '@/types/user';

const host = '/api';
const apiVersion = '/v1';

const locale = sessionStorage.getItem('locale') || 'en';

export const apiAxios = defaultAxios.default.create({
    baseURL: joinPaths([host, apiVersion, locale]),
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

export const axios = defaultAxios.default.create({
    baseURL: host,
});

const ResponseHandler = (response: AxiosResponse) => {
    return response;
};

const ResponseErrorHandler = async (error: any) => {
    const {
        response: { status, data },
        config,
    } = error;

    console.log(error);

    if (
        status === 401 &&
        ['Invalid JWT Token', 'Expired JWT Token', 'JWT Token not found'].includes(data.message) &&
        !config.__isRetryRequest
    ) {
        config.__isRetryRequest = true;
        try {
            await axios.post<{ refreshToken: string; token: string; user: User }>('/token/refresh');
            return apiAxios(config);
        } catch (error) {
            return Promise.reject(error);
        }
    }
    return Promise.reject(error);
};

apiAxios.interceptors.response.use(
    (response) => ResponseHandler(response),
    (error) => ResponseErrorHandler(error),
);
