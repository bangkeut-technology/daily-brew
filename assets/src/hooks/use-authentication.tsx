import React from 'react';
import { AuthenticationContext } from '@/contexts/authentication-context';

export const useAuthentication = () => {
    const context = React.useContext(AuthenticationContext);
    if (!context) {
        throw new Error('useAuthentication must be used within an AuthenticationProvider');
    }
    return context;
};
