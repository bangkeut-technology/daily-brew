import React from 'react';
import { User } from '@/types/user';

export interface AuthenticationContextValue {
    isAuthenticated: boolean;
    user: User | undefined;
    setEmail: (email: string) => void;
}

export const AuthenticationContext = React.createContext<AuthenticationContextValue>({
    isAuthenticated: false,
    user: undefined,
    setEmail: () => {},
});
