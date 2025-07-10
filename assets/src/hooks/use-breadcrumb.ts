import React from 'react';
import { BreadcrumbContext } from '@/contexts/bread-crumb-context';

export const useBreadcrumb = () => {
    return React.useContext(BreadcrumbContext);
};
