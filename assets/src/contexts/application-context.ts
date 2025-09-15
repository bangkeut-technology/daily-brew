import React from 'react';

export interface ApplicationContextValue {
    maxFreeEmployees: number;
    maxFreeTemplates: number;
    storeAllowed: boolean;
    contactEmail?: string;
}

export const ApplicationContext = React.createContext<ApplicationContextValue>({
    maxFreeEmployees: 0,
    maxFreeTemplates: 0,
    storeAllowed: false,
    contactEmail: undefined,
});
