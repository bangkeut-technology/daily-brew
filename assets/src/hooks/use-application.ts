import React from 'react';
import { ApplicationContext } from '@/contexts/application-context';

export const useApplication = () => {
    const context = React.useContext(ApplicationContext);
    if (!context) {
        throw new Error('useApplication must be used within an ApplicationProvider');
    }
    return context;
};
