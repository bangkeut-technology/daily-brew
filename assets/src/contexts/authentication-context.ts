import React from 'react';
import { User } from '@/types/user';
import { Workspace } from '@/types/workspace';

export type AuthenticationStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthenticationState {
    status: AuthenticationStatus;
    demo: boolean;
    user: User | undefined;
    workspace?: Workspace;
}

export type AuthenticationAction =
    | { type: 'SIGN_IN'; user: User }
    | { type: 'SET_WORKSPACE'; workspace: Workspace }
    | { type: 'SIGN_OUT' };

export const AuthenticationContextState = React.createContext<AuthenticationState>({
    demo: false,
    user: undefined,
    status: 'loading',
    workspace: undefined,
});

export const AuthenticationContextDispatch = React.createContext<React.Dispatch<AuthenticationAction>>(() => {});
