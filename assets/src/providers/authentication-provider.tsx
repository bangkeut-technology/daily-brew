import React from 'react';
import { AuthenticationContext } from '@/contexts/authentication-context';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@/services/user';

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [email, setEmail] = React.useState(sessionStorage.getItem('email'));

    const { data } = useQuery({
        queryKey: ['me'],
        enabled: !!email,
        queryFn: fetchCurrentUser,
    });

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated: !!email, user: data, setEmail: setEmail }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
