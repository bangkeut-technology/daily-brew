import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';
import { authenticationReducer } from '@/reducers/authentication-reducer';
import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { AuthenticationState } from '@/contexts/authentication-context';

function getInitialState(): AuthenticationState {
    const serverUser = window.__DAILYBREW__?.user;
    if (serverUser && typeof serverUser === 'object' && 'publicId' in serverUser) {
        return {
            status: 'authenticated',
            user: serverUser as AuthenticationState['user'],
            workspace: undefined,
        };
    }
    if (serverUser === null) {
        // Server confirmed no user — skip the API call
        return {
            status: 'unauthenticated',
            user: undefined,
            workspace: undefined,
        };
    }
    // Fallback: server didn't provide user info, check via API
    return {
        status: 'loading',
        user: undefined,
        workspace: undefined,
    };
}

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(authenticationReducer, undefined, getInitialState);

    // Only fire /users/me if server didn't embed user data (fallback)
    const { data, isSuccess, isError } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await apiAxios.get('/users/me');
            return data;
        },
        enabled: state.status === 'loading',
        retry: false,
        staleTime: 0,
    });

    const { data: workspace } = useQuery({
        queryKey: ['my-current-workspace'],
        queryFn: async () => {
            const { data } = await apiAxios.get('/users/me/current-workspace');
            return data;
        },
        enabled: state.status === 'authenticated',
        retry: false,
    });

    React.useEffect(() => {
        if (isError) dispatch({ type: 'SIGN_OUT' });
    }, [isError]);

    React.useEffect(() => {
        if (isSuccess && data) dispatch({ type: 'SIGN_IN', user: data });
    }, [isSuccess, data]);

    React.useEffect(() => {
        if (workspace) dispatch({ type: 'SET_WORKSPACE', workspace });
    }, [workspace]);

    return (
        <AuthenticationContextState.Provider value={state}>
            <AuthenticationContextDispatch.Provider value={dispatch}>
                {children}
            </AuthenticationContextDispatch.Provider>
        </AuthenticationContextState.Provider>
    );
};

AuthenticationProvider.displayName = 'AuthenticationProvider';
