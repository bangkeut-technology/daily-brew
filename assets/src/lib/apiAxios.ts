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

// Mutex: ensure only one refresh request runs at a time.
// Concurrent 401s queue behind the first refresh call.
let refreshPromise: Promise<void> | null = null;

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
            // If a refresh is already in-flight, wait for it instead of firing another
            if (!refreshPromise) {
                refreshPromise = axios.post('/token/refresh').then(
                    () => {},
                    (err) => { throw err; },
                ).finally(() => { refreshPromise = null; });
            }
            await refreshPromise;
            return apiAxios(config);
        } catch {
            refreshPromise = null;
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
