import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';
import { authenticationReducer } from '@/reducers/authentication-reducer';
import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import { getWorkspacePublicId, clearWorkspacePublicId } from '@/lib/auth';
import type { AuthenticationState } from '@/contexts/authentication-context';

function getInitialState(): AuthenticationState {
    // Always verify auth state via API — the main firewall does not authenticate,
    // so the SPA checks via the /api firewall where the Axios interceptor handles
    // JWT refresh transparently.
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

    // Fetch current workspace from server (source of truth)
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

    // Sync workspace from server → localStorage (server is authoritative)
    React.useEffect(() => {
        if (workspace === undefined) return; // still loading

        if (workspace && workspace.publicId) {
            dispatch({ type: 'SET_WORKSPACE', workspace });
            // Sync server workspace to localStorage
            localStorage.setItem('workspace_public_id', workspace.publicId);
        } else {
            // Server says no workspace — clear stale localStorage
            dispatch({ type: 'SET_WORKSPACE', workspace: undefined as any });
            clearWorkspacePublicId();
        }
    }, [workspace]);

    // On sign-in, if user has a currentWorkspacePublicId and localStorage is empty, restore it
    React.useEffect(() => {
        if (state.status === 'authenticated' && state.user?.currentWorkspacePublicId && !getWorkspacePublicId()) {
            localStorage.setItem('workspace_public_id', state.user.currentWorkspacePublicId);
        }
    }, [state.status, state.user]);

    return (
        <AuthenticationContextState.Provider value={state}>
            <AuthenticationContextDispatch.Provider value={dispatch}>
                {children}
            </AuthenticationContextDispatch.Provider>
        </AuthenticationContextState.Provider>
    );
};

AuthenticationProvider.displayName = 'AuthenticationProvider';
