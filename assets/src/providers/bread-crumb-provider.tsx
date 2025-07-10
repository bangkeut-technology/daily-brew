import React from 'react';
import { BreadcrumbContext } from '@/contexts/bread-crumb-context';

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
    const [lastCrumb, setLastCrumb] = React.useState<string>();

    return <BreadcrumbContext.Provider value={{ lastCrumb, setLastCrumb }}>{children}</BreadcrumbContext.Provider>;
};
