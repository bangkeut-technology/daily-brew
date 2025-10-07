import React from 'react';
import { AuthenticationContext } from '@/contexts/authentication-context';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '@/services/user';

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [email, setEmail] = React.useState(sessionStorage.getItem('email'));
    const [demo, setDemo] = React.useState(false);
    const [expiresAt, setExpiresAt] = React.useState<Date | null>(null);

    const { data, isSuccess } = useQuery({
        queryKey: ['me'],
        enabled: !!email,
        queryFn: fetchCurrentUser,
    });

    React.useEffect(() => {
        if (isSuccess && data) {
            setDemo(data.roles.includes('ROLE_DEMO'));
            setEmail(data.email);
            sessionStorage.setItem('email', data.email);
        }
    }, [isSuccess]);

    return (
        <AuthenticationContext.Provider value={{ isAuthenticated: !!email, user: data, setEmail: setEmail, demo }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
