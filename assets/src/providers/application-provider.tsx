import React from 'react';
import { ApplicationContext, ApplicationContextValue } from '@/contexts/application-context';

export const ApplicationProvider = ({ children }: { children: React.ReactNode }) => {
    const state = React.useMemo<ApplicationContextValue>(() => {
        const application = sessionStorage.getItem('application');
        if (application) {
            try {
                const applicationState = JSON.parse(application);
                return {
                    maxFreeEmployees: applicationState.maxFreeEmployees || 10,
                    maxFreeTemplates: applicationState.maxFreeTemplates || 5,
                    storeAllowed: applicationState.storeAllowed === 'true',
                    contactEmail: applicationState.contactEmail,
                };
            } catch (error) {
                console.error('Failed to parse application setting:', error);
            }
        }
        return {
            maxFreeEmployees: 0,
            maxFreeTemplates: 0,
            storeAllowed: false,
            contactEmail: undefined,
        };
    }, []);

    return <ApplicationContext.Provider value={state}>{children}</ApplicationContext.Provider>;
};
