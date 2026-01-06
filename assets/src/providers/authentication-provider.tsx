import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser, fetchCurrentWorkspace } from '@/services/user';
import { authenticationInitialState, authenticationReducer } from '@/reducers/authentication-reducer';

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(authenticationReducer, authenticationInitialState);

    const { data, isSuccess, isError } = useQuery({
        queryKey: ['me'],
        queryFn: fetchCurrentUser,
        enabled: state.status === 'loading',
        retry: false,
        staleTime: 0,
    });

    const { data: workspace } = useQuery({
        queryKey: ['my-current-workspace'],
        enabled: state.status === 'authenticated',
        queryFn: fetchCurrentWorkspace,
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

    if (state.status === 'loading') return <FullScreenLoader />;

    return (
        <AuthenticationContextState.Provider value={state}>
            <AuthenticationContextDispatch.Provider value={dispatch}>{children}</AuthenticationContextDispatch.Provider>
        </AuthenticationContextState.Provider>
    );
};

AuthenticationProvider.displayName = 'AuthenticationProvider';

const FullScreenLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-muted border-t-primary" />
            <span className="text-sm text-muted-foreground">Checking session...</span>
        </div>
    </div>
);
