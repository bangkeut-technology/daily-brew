import React from 'react';

export interface ApplicationContextValue {
    maxFreeEmployees: number;
    maxFreeTemplates: number;
    storeAllowed: boolean;
}

export const ApplicationContext = React.createContext<ApplicationContextValue>({
    maxFreeEmployees: 0,
    maxFreeTemplates: 0,
    storeAllowed: false,
});
