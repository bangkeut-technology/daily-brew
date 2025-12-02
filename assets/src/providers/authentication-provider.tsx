import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@/services/user';
import { authenticationInitialState, authenticationReducer } from '@/reducers/authentication-reducer';

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(authenticationReducer, authenticationInitialState);

    const { data, isSuccess } = useQuery({
        queryKey: ['me'],
        enabled: !!sessionStorage.getItem('email'),
        queryFn: fetchCurrentUser,
    });

    React.useEffect(() => {
        if (isSuccess && data) {
            dispatch({ type: 'SIGN_IN', user: data });
        }
    }, [data, isSuccess]);

    return (
        <AuthenticationContextState.Provider value={state}>
            <AuthenticationContextDispatch value={dispatch}>{children}</AuthenticationContextDispatch>
        </AuthenticationContextState.Provider>
    );
};
