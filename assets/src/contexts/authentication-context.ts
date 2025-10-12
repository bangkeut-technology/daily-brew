import React from 'react';
import { User } from '@/types/user';

export interface AuthenticationState {
    isAuthenticated: boolean;
    demo: boolean;
    user: User | undefined;
}

export type AuthenticationAction = { type: 'LOGIN'; user: User } | { type: 'LOGOUT' };

export const AuthenticationContextState = React.createContext<AuthenticationState>({
    isAuthenticated: false,
    demo: false,
    user: undefined,
});

export const AuthenticationContextDispatch = React.createContext<React.Dispatch<AuthenticationAction>>(() => {});
