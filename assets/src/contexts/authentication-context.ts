import { createContext } from 'react';
import type { User, Workspace } from '@/types/user';

export type AuthenticationStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthenticationState {
    status: AuthenticationStatus;
    user: User | null;
    workspace: Workspace | null;
}

export interface AuthenticationContextType extends AuthenticationState {
    setWorkspace: (workspace: Workspace) => void;
    signOut: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);
