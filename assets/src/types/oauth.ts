import React from 'react';

export type ProviderKey = 'apple' | 'google';

export type Provider = {
    key: ProviderKey;
    name: string;
    icon: React.ReactNode;
    hide: boolean;
};
