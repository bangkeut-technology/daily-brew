import React from 'react';
import { User } from '@/types/User';

export interface AuthenticationContextValue {
    isAuthenticated: boolean;
    user: User | undefined;
    setUsername: (username: string) => void;
}

export const AuthenticationContext = React.createContext<AuthenticationContextValue>({
    isAuthenticated: false,
    user: undefined,
    setUsername: () => {},
});
