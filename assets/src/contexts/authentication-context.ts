import React from 'react';
import { User } from '@/types/user';

export interface AuthenticationContextValue {
    isAuthenticated: boolean;
    demo: boolean;
    user: User | undefined;
    setEmail: (email: string) => void;
}

export const AuthenticationContext = React.createContext<AuthenticationContextValue>({
    isAuthenticated: false,
    demo: false,
    user: undefined,
    setEmail: () => {},
});
