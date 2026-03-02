import React from 'react';

export type NavTabItem = {
    label: string;
    path: string;
    pathname: string;
    params?: Record<string, string>;
    search?: Record<string, string>;
    icon?: React.ReactNode;
    hide?: boolean;
    badge?: string;
    disabled?: boolean;
};
