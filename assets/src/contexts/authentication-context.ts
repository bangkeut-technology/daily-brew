import React from 'react';
import type { User, Workspace } from '@/types/user';

export type AuthenticationStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthenticationState {
    status: AuthenticationStatus;
    user: User | undefined;
    workspace?: Workspace;
}

export type AuthenticationAction =
    | { type: 'SIGN_IN'; user: User }
    | { type: 'SET_WORKSPACE'; workspace: Workspace }
    | { type: 'UPDATE_USER'; user: User }
    | { type: 'SIGN_OUT' };

export const AuthenticationContextState = React.createContext<AuthenticationState>({
    user: undefined,
    status: 'loading',
    workspace: undefined,
});

export const AuthenticationContextDispatch = React.createContext<React.Dispatch<AuthenticationAction>>(() => {});
