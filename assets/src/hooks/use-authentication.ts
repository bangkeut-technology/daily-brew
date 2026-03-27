import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';

export const useAuthenticationState = () => {
    return React.useContext(AuthenticationContextState);
};

export const useAuthenticationDispatch = () => {
    return React.useContext(AuthenticationContextDispatch);
};

/** Convenience hook for components that just need user + workspace */
export const useAuthentication = () => {
    const state = useAuthenticationState();
    return state;
};
