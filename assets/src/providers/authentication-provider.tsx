import React, { useCallback, useEffect, useReducer, type ReactNode } from 'react';
import { AuthenticationContext } from '@/contexts/authentication-context';
import {
    authenticationReducer,
    initialAuthenticationState,
} from '@/reducers/authentication-reducer';
import { apiAxios } from '@/lib/apiAxios';
import type { Workspace } from '@/types/user';

interface Props {
    children: ReactNode;
}

export function AuthenticationProvider({ children }: Props) {
    const [state, dispatch] = useReducer(authenticationReducer, initialAuthenticationState);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: user } = await apiAxios.get('/users/me');
                let workspace: Workspace | null = null;
                try {
                    const { data: ws } = await apiAxios.get('/users/me/current-workspace');
                    workspace = ws;
                } catch {
                    // No workspace yet
                }
                dispatch({ type: 'SIGN_IN', user, workspace });
            } catch {
                dispatch({ type: 'SIGN_OUT' });
            }
        };

        fetchUser();
    }, []);

    const setWorkspace = useCallback((workspace: Workspace) => {
        dispatch({ type: 'SET_WORKSPACE', workspace });
    }, []);

    const signOut = useCallback(async () => {
        try {
            await apiAxios.post('/auth/logout');
        } catch {
            // Ignore logout errors
        }
        dispatch({ type: 'SIGN_OUT' });
        window.location.href = '/sign-in';
    }, []);

    return (
        <AuthenticationContext.Provider value={{ ...state, setWorkspace, signOut }}>
            {children}
        </AuthenticationContext.Provider>
    );
}
