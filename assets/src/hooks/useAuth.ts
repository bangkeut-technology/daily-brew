import { useCallback } from 'react';
import { apiAxios } from '@/lib/apiAxios';

export function useAuth() {
    const login = useCallback(async (email: string, password: string) => {
        const { data } = await apiAxios.post('/auth/login', { email, password });
        return data;
    }, []);

    const register = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
        const { data } = await apiAxios.post('/auth/register', { email, password, firstName, lastName });
        return data;
    }, []);

    const loginWithGoogle = useCallback(async (idToken: string) => {
        const { data } = await apiAxios.post('/auth/google', { idToken });
        return data;
    }, []);

    const loginWithApple = useCallback(async (identityToken: string, email?: string) => {
        const { data } = await apiAxios.post('/auth/apple', { identityToken, email });
        return data;
    }, []);

    return { login, register, loginWithGoogle, loginWithApple };
}
