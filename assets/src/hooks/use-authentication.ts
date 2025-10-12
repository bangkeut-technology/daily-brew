import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';

export const useAuthenticationState = () => {
    const context = React.useContext(AuthenticationContextState);
    if (!context) {
        throw new Error('useAuthenticationState must be used within an AuthenticationProvider');
    }
    return context;
};

export const useAuthenticationDispatch = () => {
    const context = React.useContext(AuthenticationContextDispatch);
    if (!context) {
        throw new Error('useAuthenticationDispatch must be used within an AuthenticationProvider');
    }
    return context;
};
