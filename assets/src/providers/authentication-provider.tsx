import React from 'react';
import { AuthenticationContext } from '@/contexts/authentication-context';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@/services/user';

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [username, setUsername] = React.useState(sessionStorage.getItem('username'));

    const { data } = useQuery({
        queryKey: ['me'],
        enabled: !!username,
        queryFn: fetchCurrentUser,
    });

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated: !!username, user: data, setUsername: setUsername }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
