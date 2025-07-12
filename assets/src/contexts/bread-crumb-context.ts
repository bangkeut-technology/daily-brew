import React from 'react';

interface BreadcrumbContextValue {
    lastCrumb: string | undefined;
    setLastCrumb: (lastCrumb: string) => void;
}

export const BreadcrumbContext = React.createContext<BreadcrumbContextValue>({
    lastCrumb: undefined,
    setLastCrumb: () => {},
});
