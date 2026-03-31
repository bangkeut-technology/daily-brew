import * as defaultAxios from 'axios';
import { joinPaths } from '@tanstack/react-router';
import type { AxiosResponse } from 'axios';
import { clearWorkspacePublicId, emitWorkspaceInvalid } from '@/lib/auth';

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

/** Bare axios instance (no locale prefix) — used for token refresh. */
export const axios = defaultAxios.default.create({
    baseURL: joinPaths([host, apiVersion]),
    withCredentials: true,
});

const ResponseHandler = (response: AxiosResponse) => response;

const ResponseErrorHandler = async (error: any) => {
    const { response, config } = error;
    if (!response) return Promise.reject(error);

    const { status, data } = response;

    if (
        status === 401 &&
        ['Invalid JWT Token', 'Expired JWT Token', 'JWT Token not found'].includes(data?.message) &&
        !config.__isRetryRequest
    ) {
        config.__isRetryRequest = true;
        try {
            await axios.post('/token/refresh');
            return apiAxios(config);
        } catch {
            return Promise.reject(error);
        }
    }

    // 403 on workspace-scoped endpoints → workspace may be stale
    if (status === 403 && config?.url?.includes('/workspaces/')) {
        clearWorkspacePublicId();
        emitWorkspaceInvalid();
    }

    return Promise.reject(error);
};

apiAxios.interceptors.response.use(ResponseHandler, ResponseErrorHandler);

export default apiAxios;
