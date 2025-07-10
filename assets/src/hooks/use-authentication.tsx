import React from 'react';
import { AuthenticationContext } from '@/contexts/authentication-context';

export const useAuthentication = () => {
    return React.useContext(AuthenticationContext);
};
